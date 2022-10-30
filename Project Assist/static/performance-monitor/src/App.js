import React, { useEffect, useState, useCallback} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import './style.css';
import $ from "jquery";
import Badge from '@atlaskit/badge';
import Avatar, { AvatarItem } from '@atlaskit/avatar';
import Button from '@atlaskit/button/standard-button';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import { N500 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';
import ProgressBar from '@atlaskit/progress-bar';
import Form, { CheckboxField, HelperMessage, ValidMessage, Field, ErrorMessage, FormFooter} from '@atlaskit/form';
import Textfield from '@atlaskit/textfield';
import TableTree, { Cell, Header, Headers, Row, Rows } from '@atlaskit/table-tree';
import { RadioGroup, Radio } from '@atlaskit/radio';
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from '@atlaskit/modal-dialog'
import { invoke, requestJira, view, router } from '@forge/bridge';


function App() {

    //project status variable
    const [data, setData] = useState({});
    useEffect(() => {
        invoke('projectStatus', { example: 'my-invoke-variable' }).then(setData);
    }, []);

    //user points
    const [points, setpoints] = useState();
    useEffect(() => {
        invoke('getPoints', { example: 'my-invoke-variable' }).then(setpoints);
    }, []);

    //user task
    const [task, settask] = useState({});
    useEffect(() => {
        invoke('getTask', { example: 'my-invoke-variable' }).then(settask);
    }, []);

    //project assist received req
    const [projectassist,setprojectassist]=useState({});
    useEffect(()=>{
      invoke('projectassistsend',{example: 'project-assist'}).then(setprojectassist);
    },[]);

    //project assist sent req status
    const[projectassiststatus,setprojectassiststatus]=useState({});
    useEffect(()=>{
      invoke('projectassiststatus',{example:'project-status'}).then(setprojectassiststatus);
    },[]);
    
    //contributions list
    const[contributionslist,setcontributionslist]=useState({});
    useEffect(()=>{
      invoke('contributions',{example:'contribution-list'}).then(setcontributionslist);
    },[]);
    console.log(contributionslist);
    //rank list
    const[ranklist,setranklist]=useState({});
    useEffect(()=>{
      invoke('rank',{example:'rank-list'}).then(setranklist);
    },[]);


    //user account number
    const[useraccountnumber,setuseraccountnumber]=useState();
    useEffect(()=>{
      invoke('useraccountnumber',{example:'user-account'}).then(setuseraccountnumber);
    },[]);


    var ranksort=Object.fromEntries(Object.entries(ranklist).sort(([,a],[,b])=>a-b));
    var ranksortlist={};
    ranksortlist= Object.entries(ranksort).sort((a,b) => b[1].points-a[1].points);
    var userrank=null;

    //user rank
    Array.from(Object.entries(ranksortlist),([key,val])=>
    {
      if(val[0]==useraccountnumber){
      userrank=key;
      
    }}
    );

    var projectreqarray=new Array();
    projectreqarray.push( { label:"Accept", value: "Accept"});
    projectreqarray.push( { label: "Reject", value: "Reject" });

    const [isOpen, setIsOpen] = useState(false);
    const openModal = useCallback(() => setIsOpen(true), []);
    const closeModal = useCallback(() => setIsOpen(false), []);
    const [isOpenrank, setIsOpenrank] = useState(false);
    const openModalrank = useCallback(() => setIsOpenrank(true), []);
    const closeModalrank = useCallback(() => setIsOpenrank(false), []);
    const [sendRequestOpen, setsendRequestOpen] = useState(false);
    const sendRequestOpenModal = useCallback(() => setsendRequestOpen(true), []);
    const sendRequestCloseModal = useCallback(() => setsendRequestOpen(false), []);
    const [receiveRequestOpen, setreceiveRequestOpen] = useState(false);
    const receiveRequestOpenModel = useCallback(() => setreceiveRequestOpen(true), []);
    const receiveRequestCloseModal = useCallback(() => setreceiveRequestOpen(false), []);
    const [formState, setFormState] = useState(undefined);
    const onSubmit = async (formData) => {
      setFormState(formData);
   };
   const consoleurl = async () => {
    const issueID=formState.projectid;

    
    let projectstatus =JSON.stringify(formState.status);
    var bodyData = `{ "fields": {"customfield_10055": ${projectstatus}}}`;
    const requesturl=await requestJira(`/rest/api/3/issue/${issueID}`,{
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: bodyData
    });
  console.log(`Response: ${requesturl.status} ${requesturl.statusText}`);
  router.reload();
  return true;
  };
  if(formState!=undefined){
  const boolval=consoleurl();
   }
    return (
        <div>
            <div class="row">
            <div class="card col-5 cardstyle">
                <div class="card-body">
                <h4 class="card-title">
                Contributions
                </h4>
                <div>
                <p>Contribution count : {Object.keys(contributionslist).length}</p>
                </div>
                <div align="right">
                <Button appearance="primary" onClick={openModal}>
                View All
                </Button>
                </div>
        <ModalTransition>
        {isOpen && (
          <Modal onClose={closeModal}>
            <ModalHeader>
              <ModalTitle>Contributions</ModalTitle>
              <Button appearance="link" onClick={closeModal}>
                <CrossIcon
                  label="Close Modal"
                  primaryColor={token('color.text.subtle', N500)}
                />
              </Button>
            </ModalHeader>
            <ModalBody>
            <table>
        <thead>
          <tr>
            <th id="head-description">Task ID</th>
            <th id="head-commit">Requestor</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(Object.entries(contributionslist),([key,val])=>
          <tr>
          <td>{val.projectId}</td>
          <td>{val.projectmember}</td>   
          </tr>
          )}
        </tbody>
      </table>
            </ModalBody>
            <ModalFooter>
              <Button appearance="primary" onClick={closeModal} autoFocus>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
                </div>                
            </div>
            <div class="card col-5 cardstyle">
                <div class="card-body">
                <h4 class="card-title">Task</h4> 
                {Array.from(Object.entries(task), ([key, value]) =>
                <div>
                <h6 class="persondetails">{value}</h6>
                <p class="persondetails">{key}</p> 
                </div>

            )}
                <div>
                </div>          
                </div>
            </div>
            <div class="card col-5 cardstyle">
                <div class="card-body">
                <h4 class="card-title">Task Level</h4>
                {Array.from(Object.entries(data), ([key, task]) =>
                <div class="taskprogress">
                <p>{key}</p>
                <ProgressBar appearance="success" ariaLabel="Done: 3 of 10 issues" value={task/100} />
                </div>
                 )}
                </div>
            </div>
            <div class="card col-5 cardstyle">
                <div class="card-body">
                <h4 class="card-title">Help Request For Project</h4>
                <p>Here you can see all the request of project assist</p>
                <div class="projectassist row" align="right">
      <div class="proassist col-4">
      <Button appearance="primary" onClick={sendRequestOpenModal}>
        Sent Request
      </Button>

      <ModalTransition>
        {sendRequestOpen && (
          <Modal onClose={sendRequestCloseModal}>
            <ModalHeader>
              <ModalTitle>Your Request</ModalTitle>
            </ModalHeader>
            <ModalBody>
            <div>
      <table>
        <thead>
          <tr>
            <th id="head-description">Task ID</th>
            <th id="head-commit">Name</th>
            <th id="head-updated">Message</th>
            <th id="head-project">Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(Object.entries(projectassiststatus),([key,val])=>
          <tr>
          <td>{val.projectId}</td>
          <td>{val.projectmember}</td>
          <td>{val.projectmessage}</td>
          <td>{val.projectstatus}</td>   
          </tr>
          )}
        </tbody>
      </table>
    </div>
            </ModalBody>
            <ModalFooter>
              <Button appearance="subtle" onClick={sendRequestCloseModal}>
                Cancel
              </Button>

            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
      </div>
      <div class="proassist col-4">
      <Button appearance="primary" onClick={receiveRequestOpenModel}>
        Received Request
      </Button>
      
      <ModalTransition>
      <Form onSubmit={onSubmit}>
        {({ formProps }) => (
          <form id="form-with-id" {...formProps}>
        {receiveRequestOpen && (
          <Modal onClose={receiveRequestCloseModal}>
            <ModalHeader>
              <ModalTitle>Project Assist Request</ModalTitle>
            </ModalHeader>
            <ModalBody>
            <div>
      <table>
        <thead>
          <tr>
            <th id="project-Key">Task</th>
            <th id="head-description">Name</th>
            <th id="head-commit">Message</th>
            <th id="head-updated">Status</th>
            <th id="head-project">Submit</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(Object.entries(projectassist),([key,val])=>
          
          <tr>
          <td>{val.projectkey}</td>
          <td>{val.projectmember}</td>
          <td>{val.projectmessage}</td>
          <td>
            <Field name="status" defaultValue="">
            {({fieldProps:{ value,...others}})=>
              <RadioGroup options={projectreqarray} {...others}/>
              }
            </Field>
            </td> 
            <Field name = "projectid" defaultValue= {val.projectId}>
           
            {({fieldProps})=>
             <td>
            <Button type="submit" form="form-with-id"> Submit</Button>
            </td>}
            </Field>    
          </tr>
          )}
        </tbody>
      </table>
    </div>
            </ModalBody>
            <ModalFooter>
              <Button appearance="subtle" onClick={receiveRequestCloseModal}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        )}
        </form>
        )}
        </Form>
      </ModalTransition>
      
      </div>
    </div>
                </div>
            </div>
            <div class="card col-5 cardstyle">
                <div class="card-body">
                <h4 class="card-title">Points</h4>
                <p>{points}</p>
                </div>
            </div>
            <div class="card col-5 cardstyle">
                <div class="card-body">
                <h4 class="card-title">Rank</h4>
                <p>
                {parseInt(userrank)+1}
                </p>
                <div align="right">
                <Button appearance="primary" onClick={openModalrank}>
                View All
                </Button>
                </div>
                <ModalTransition>
        {isOpenrank && (
          <Modal onClose={closeModalrank}>
            <ModalHeader>
              <ModalTitle>Contributions</ModalTitle>
              <Button appearance="link" onClick={closeModalrank}>
                <CrossIcon
                  label="Close Modal"
                  primaryColor={token('color.text.subtle', N500)}
                />
              </Button>
            </ModalHeader>
            <ModalBody>
            <table>
        <thead>
          <tr>
            <th id="rank">Rank</th>
            <th id="name">Name</th>
            <th id="points">Points</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(Object.entries(ranksortlist),([key,val])=>
          <tr>
          <td>{parseInt(key)+1}</td>
          <td>{val[1].names}</td>   
          <td>{val[1].points}</td>
          </tr>
          )}
        </tbody>
      </table>
            </ModalBody>
            <ModalFooter>
              <Button appearance="primary" onClick={closeModalrank} autoFocus>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
                </div>
            </div>
            </div>
            
        </div>
    );
}

export default App;
