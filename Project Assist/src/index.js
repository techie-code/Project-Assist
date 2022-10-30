import Resolver from '@forge/resolver';
import api, { route, webTrigger, storage, fetch} from '@forge/api';
const resolver = new Resolver();

resolver.define('getteammate', async (req) => {
  const teamurl=await api.asApp().requestJira(route`/rest/api/3/users/search`);
  const teamjson=await teamurl.json();
  var teamid=new Array();
  var len=teamjson.length;
  console.log("length is "+len);
  for(let i=0;i<len;i++){
    if(teamjson[i].accountType=="atlassian"){
      teamid.push(teamjson[i].accountId)
      console.log(teamjson[i].displayName);
    }
  }
  
  const response = await api.asUser().requestJira(route`/rest/api/3/search`);
  const datas = await response.json();
  var teampoints={};
  for(let i=0;i<teamid.length;i++){
  var teamdetails={};
  var useraccountId=teamid[i];
  const persondata=await api.asApp().requestJira(route `/rest/api/3/user/search?accountId=${useraccountId}`);
  const personjson=await persondata.json();
  const personname=personjson[0].displayName;
  var points =0;
  for(let j=0;j<datas.issues.length;j++){
        if(datas.issues[j].fields.assignee.accountId==useraccountId&&datas.issues[j].fields.status.statusCategory.key=="done"){
            points=points+datas.issues[j].fields.customfield_10046;
        }
  }
  const projectresponse=await api.asApp().requestJira(route `/rest/api/3/search`);
    const projectresponsejson= await projectresponse.json();
    const len=projectresponsejson.issues.length;
    for(let i=0;i<len;i++){
        if(projectresponsejson.issues[i].fields.customfield_10053==useraccountId&&projectresponsejson.issues[i].fields.customfield_10055=="Accept"&&projectresponsejson.issues[i].fields.status.statusCategory.key=="done"){
           points=points+10;
        }

    }  
  teamdetails["names"]=personname;
  teamdetails["points"]=points;
  teampoints[useraccountId]=teamdetails;
}
  console.log(JSON.stringify(teampoints));
  return teampoints;

});
resolver.define('projectassisturl', async (req) =>{

var projectsource={}
const project=req.context.extension.project;
const projectkey=project.key;
const issueid = req.context.extension.issue;
const issuekey=issueid.key;
const url=await api.asUser().requestJira(route `/rest/api/3/issue/${issuekey}`);
const urldata=await url.json();
const labels=urldata.fields.labels;
const confluencepage=await api.asApp().requestConfluence(route`/wiki/rest/api/content`, {
  headers: {
    'Accept': 'application/json'
  }
});
const confluencepagedatas=await confluencepage.json();
const confdata=confluencepagedatas.results;
var c=0;
for(let i=0;i<labels.length;i++){
    for(let j=0;j<confluencepagedatas.results.length;j++){
      
      if(confluencepagedatas.results[j].title.includes(labels[i])){
        projectsource[c]=confluencepagedatas._links.base+confluencepagedatas.results[j]._links.webui;
        console.log(projectsource[c]);
        c=c+1;
      }
    }
}
console.log(urldata.fields.labels)
 console.log("url web is "+JSON.stringify(project))
 console.log(JSON.stringify(projectsource));
  return projectsource;
  
});
resolver.define('projectStatus', async (req) =>{
  var projectarray=new Array();
  var projectstatus={};
  var projectlevel=0;
  const userresponse=await api.asUser().requestJira(route `/rest/api/3/myself`);
  const userdatas=await userresponse.json();
  const useraccountId=userdatas.accountId;
  const response = await api.asUser().requestJira(route`/rest/api/3/search`);
  const datas = await response.json();
  
  for(let i=0;i<datas.issues.length;i++){
  var taskstatus="task";
  if(datas.issues[i].fields.assignee.accountId==useraccountId||datas.issues[i].fields.reporter.accountId==useraccountId){
      if(datas.issues[i].fields.status.statusCategory.key!="done"){
          projectarray.push(datas.issues[i].id);
      }
  }
  }
  for(let i=0;i<projectarray.length;i++){
  const worklogresponse=await api.asUser().requestJira(route `/rest/api/3/issue/${projectarray[i]}`);
  const worklogdatas=await worklogresponse.json();
  var summary=worklogdatas.fields.summary;
  var projectcomplete=worklogdatas.fields.timetracking.timeSpentSeconds;
  var projectremaining=worklogdatas.fields.timetracking.remainingEstimateSeconds;
  if(projectcomplete==null){
      projectcomplete=0;
  }
  if(projectremaining==null){
      projectremaining=0;
  }
 
  var projectpercent=(projectcomplete/(projectcomplete+projectremaining))*100;
 
  projectstatus[summary]=projectpercent;
 
  }
  Array.from(Object.entries(projectstatus), ([key, value]) =>{
      projectlevel=projectlevel+value;
  });
 
  var projectworklog=(projectlevel/(Object.keys(projectstatus).length*100))*100;
  projectstatus["Total Task Level"]=projectworklog;
 
  return projectstatus;
});
resolver.define('getTask', async () =>{
  const Simpleresponse = await api.asApp().requestJira(route`/rest/api/3/uiModifications`, {
      headers: {
        'Accept': 'application/json'
      }
  });

  var projectarray={};
  const userresponse=await api.asUser().requestJira(route `/rest/api/3/myself`);
  const userdatas=await userresponse.json();
  
  const useraccountId=userdatas.accountId;
  const response = await api.asUser().requestJira(route`/rest/api/3/search`);
  const datas = await response.json();
 
  for(let i=0;i<datas.issues.length;i++){
  var taskstatus="Task: ";
  if(datas.issues[i].fields.assignee.accountId==useraccountId&&datas.issues[i].fields.status.statusCategory.key!="done"){
  if(datas.issues[i].fields.issuetype.subtask==true){
      taskstatus="Sub Task: ";
  }
  projectarray[datas.issues[i].fields.summary]=taskstatus;
  }
  }
 
  return projectarray;
});



resolver.define('getSimple', async () =>{
  const response = await api.asApp().requestJira(route`/rest/api/3/search`);
  const datas = await response.json();
  return datas.maxResults;
});
resolver.define('getPoints', async () =>{
  var points =0;
  const userresponse=await api.asUser().requestJira(route `/rest/api/3/myself`);
  const userdatas=await userresponse.json();
  const useraccountId=userdatas.accountId;
  
  const response = await api.asUser().requestJira(route`/rest/api/3/search`);
  const datas = await response.json();
  for(let i=0;i<datas.issues.length;i++){
      var taskstatus="Task: ";
      if(datas.issues[i].fields.assignee.accountId==useraccountId&&datas.issues[i].fields.status.statusCategory.key=="done"){
          points=points+datas.issues[i].fields.customfield_10046;
      }
  }
  const projectresponse=await api.asApp().requestJira(route `/rest/api/3/search`);
  const projectresponsejson= await projectresponse.json();
  const len=projectresponsejson.issues.length;
  for(let i=0;i<len;i++){
      if(projectresponsejson.issues[i].fields.customfield_10053==useraccountId&&projectresponsejson.issues[i].fields.customfield_10055=="Accept"&&projectresponsejson.issues[i].fields.status.statusCategory.key=="done"){
         points=points+10;
      }

  }  
  return points;
});



resolver.define('projectassistsend',async()=>{
  const projectresponse=await api.asApp().requestJira(route `/rest/api/3/search`);
  const projectresponsejson= await projectresponse.json();
  const len=projectresponsejson.issues.length;
  const userresponse=await api.asUser().requestJira(route `/rest/api/3/myself`);
  const userdatas=await userresponse.json();
  const useraccountId=userdatas.accountId;
  
  const projectarray={};
  var count=0;
  for(let i=0;i<len;i++){
      var projectkeyval={};
      var projectmessage=null;
      var projectmember=null;
      
      var projectid=null;
      var projectkey=null;
      if(projectresponsejson.issues[i].fields.customfield_10053==useraccountId&&projectresponsejson.issues[i].fields.customfield_10055=="Pending"){
          projectid=projectresponsejson.issues[i].id;
          projectkey=projectresponsejson.issues[i].key;
          projectmessage=projectresponsejson.issues[i].fields.customfield_10052;
          projectmember=projectresponsejson.issues[i].fields.customfield_10054;
          const member = await api.asApp().requestJira(route`/rest/api/3/user?accountId=${projectmember}`);
          const memberjson=await member.json();
          const membername=memberjson.displayName;
          projectkeyval["projectkey"]=projectkey;
          projectkeyval["projectmember"]=membername;
          projectkeyval["projectmessage"]=projectmessage;
          projectkeyval["projectId"]=projectid;
          projectarray[count]=projectkeyval;
          count=count+1;
      }

  }
  return projectarray;
});

resolver.define('projectassiststatus',async()=>{
  const projectresponse=await api.asApp().requestJira(route `/rest/api/3/search`);
  const projectresponsejson= await projectresponse.json();
  const len=projectresponsejson.issues.length;
  const userresponse=await api.asUser().requestJira(route `/rest/api/3/myself`);
  const userdatas=await userresponse.json();
  const useraccountId=userdatas.accountId;
  const projectarray={};
  var count=0;
  for(let i=0;i<len;i++){
      var projectkeyval={};
      var projectmessage=null;
      var projectmember=null;
      var projectstatus=null;
     
      var projectid=null;
      console.log("console "+projectresponsejson.issues[i].fields.customfield_10053);
      if(projectresponsejson.issues[i].fields.customfield_10054==useraccountId && projectresponsejson.issues[i].fields.status.statusCategory.key!="done"){
          console.log("simple");
          projectid=projectresponsejson.issues[i].key;
          projectmessage=projectresponsejson.issues[i].fields.customfield_10052;
          projectmember=projectresponsejson.issues[i].fields.customfield_10053;
          projectstatus=projectresponsejson.issues[i].fields.customfield_10055;
          const member = await api.asApp().requestJira(route`/rest/api/3/user?accountId=${projectmember}`);
          const memberjson=await member.json();
          const membername=memberjson.displayName;
          projectkeyval["projectmember"]=membername;
          projectkeyval["projectmessage"]=projectmessage;
          projectkeyval["projectId"]=projectid;
          projectkeyval["projectstatus"]=projectstatus;
          projectarray[count]=projectkeyval;
          count=count+1;
      }

  }
  return projectarray;
});

resolver.define('contributions',async()=>{
  const projectresponse=await api.asApp().requestJira(route `/rest/api/3/search`);
  const projectresponsejson= await projectresponse.json();
  const len=projectresponsejson.issues.length;
  const userresponse=await api.asUser().requestJira(route `/rest/api/3/myself`);
  const userdatas=await userresponse.json();
  const useraccountId=userdatas.accountId;
  const projectarray={};
  var count=0;
  for(let i=0;i<len;i++){
      var projectkeyval={};
      var projectmember=null;
      var projectid=null;
      if(projectresponsejson.issues[i].fields.customfield_10053==useraccountId&&projectresponsejson.issues[i].fields.customfield_10055=="Accept"&&projectresponsejson.issues[i].fields.status.statusCategory.key=="done"){
          projectid=projectresponsejson.issues[i].key;
          projectmember=projectresponsejson.issues[i].fields.customfield_10054;
          const member = await api.asApp().requestJira(route`/rest/api/3/user?accountId=${projectmember}`);
          const memberjson=await member.json();
          const membername=memberjson.displayName;
          projectkeyval["projectmember"]=membername;
          projectkeyval["projectId"]=projectid;
          projectarray[count]=projectkeyval;
          count=count+1;
      }

  }
  return projectarray;
});
resolver.define('rank', async (req) => {
  const teamurl=await api.asApp().requestJira(route`/rest/api/3/users/search`);
  const teamjson=await teamurl.json();
  var teamid=new Array();
  var len=teamjson.length;
  console.log("length is "+len);
  for(let i=0;i<len;i++){
    if(teamjson[i].accountType=="atlassian"){
      teamid.push(teamjson[i].accountId)
      console.log(teamjson[i].displayName);
    }
  }
  
  const response = await api.asUser().requestJira(route`/rest/api/3/search`);
  const datas = await response.json();
  var teampoints={};
  for(let i=0;i<teamid.length;i++){
  var teamdetails={};
  var useraccountId=teamid[i];
  const persondata=await api.asApp().requestJira(route `/rest/api/3/user/search?accountId=${useraccountId}`);
  const personjson=await persondata.json();
  const personname=personjson[0].displayName;
  var points =0;
  for(let j=0;j<datas.issues.length;j++){
        if(datas.issues[j].fields.assignee.accountId==useraccountId&&datas.issues[j].fields.status.statusCategory.key=="done"){
            points=points+datas.issues[j].fields.customfield_10046;
        }
  }
  const projectresponse=await api.asApp().requestJira(route `/rest/api/3/search`);
  const projectresponsejson= await projectresponse.json();
  const len=projectresponsejson.issues.length;
  for(let i=0;i<len;i++){
      if(projectresponsejson.issues[i].fields.customfield_10053==useraccountId&&projectresponsejson.issues[i].fields.customfield_10055=="Accept"&&projectresponsejson.issues[i].fields.status.statusCategory.key=="done"){
         points=points+10;
      }

  }  
  teamdetails["names"]=personname;
  teamdetails["points"]=points;
  teampoints[useraccountId]=teamdetails;
}
  console.log(JSON.stringify(teampoints));
  return teampoints;

});

resolver.define('useraccountnumber', async (req)=>{
  const userresponse=await api.asUser().requestJira(route `/rest/api/3/myself`);
  const userdatas=await userresponse.json();
  const useraccountId=userdatas.accountId;
  return useraccountId;
});

export const handler = resolver.getDefinitions();
