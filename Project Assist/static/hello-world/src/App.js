import React, { useEffect, useState,Component, Fragment , SyntheticEvent, useCallback} from 'react';
import { requestJira, invoke, view, router } from '@forge/bridge';
import Button from '@atlaskit/button/standard-button';
import { Checkbox } from '@atlaskit/checkbox';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import SectionMessage from '@atlaskit/section-message';
import './style.css';
import { OptionsPropType } from '@atlaskit/radio/types';

import ModalDialog, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from '@atlaskit/modal-dialog';
import Select, { OptionType, ValueType } from '@atlaskit/select';
import { RadioGroup, Radio } from '@atlaskit/radio';
import Textfield from '@atlaskit/textfield';
import Form, { CheckboxField, HelperMessage, ValidMessage, Field, ErrorMessage, FormFooter} from '@atlaskit/form';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';


function App() {
  
  // project source url
  const [dataurl, setDataurl] = useState({});

  useEffect(() => {
    invoke('projectassisturl', { example: 'my-invoke-variable' }).then(setDataurl);
  }, []);


  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);

  const close = () => setIsOpen(false);

  //teammates details
 const [teamdata, setteamdata] = useState({});
 useEffect(() => {
   invoke('getteammate', { example: 'my-invoke-variable' }).then(setteamdata);
 }, []);

 //formdatas
const [formState, setFormState] = useState(undefined);
const onSubmit = async (formData) => {
   console.log(formData);
   setFormState(formData);
};


const consoleurl = async () => {
  
  const context = await view.getContext();
  const issueID=context.extension.issue.id;
  const teamdetailstring=JSON.stringify(formState.teamdetails);
  const projectmember=JSON.stringify(context.accountId);
  const projectmessage=JSON.stringify(formState.message);
  let projectstatus = 'pending';
  //org-------------------------
 var bodyData = `{ "fields": {"customfield_10053": ${teamdetailstring}, "customfield_10052": ${projectmessage},  "customfield_10054": ${projectmember}, "customfield_10055": "Pending"}}`;
  console.log(formState.teamdetails);
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


  var teamsize=Object.keys(teamdata).length;

  return true;
};


if(formState!=undefined){
 const boolval=consoleurl();
 
};
var teamdetailsarray=new Array();
Array.from(Object.entries(teamdata), ([key, values]) =>
teamdetailsarray.push( { label: values.names+" ( Points: "+values.points+" )", value: key })
);

  return (
    <div class="projectassistdiv">
    <h2>PROJECT ASSIST</h2>

    <p>The Learning Materials of the task.</p>

    <p>URL:</p>

    {Array.from(Object.entries(dataurl), ([key, url]) =>  
     <li><a href={url}>Link: {url}</a></li>
    )}

    <div align="right" class="teambutton">

      <Button onClick={open}>Ask your Teammate</Button>

    </div>
    <ModalTransition>
      {isOpen && (
          <ModalDialog onClose={close}>
            <Form onSubmit={onSubmit}>
            {({ formProps }) => (
              <form id="form-with-id" {...formProps}>
                <ModalHeader>
                    <ModalTitle>Ask Teammate</ModalTitle>
                </ModalHeader>

                <ModalBody>
                    <p>
                     Here you can send the request for Project Assist
                    </p>
                    <Field label="Teammates" name="teamdetails" defaultValue="" isRequired>
                       { ({ fieldProps:{ value, ...others } }) => 
                       <RadioGroup options={teamdetailsarray}  {...others}/>
                        }
                </Field>
                <Field label="Message" name="message" defaultValue="" isRequired>
                      {({ fieldProps }) => <Textfield {...fieldProps} />}
                </Field>
                
                
              </ModalBody>
              <ModalFooter>
                    <Button onClick={close} appearance="subtle">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      form="form-with-id"
                      appearance="primary"
                    >
                      Submit
                    </Button>
              </ModalFooter>
              </form>
              )}
            </Form>
            
          </ModalDialog>
        )}
      </ModalTransition>
      </div>
  );
}

export default App;
