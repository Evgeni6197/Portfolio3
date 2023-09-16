document.addEventListener('DOMContentLoaded', function() {
   
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);  

  // By default, load the inbox
   load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Pre-fill the composition form fields for  replying letter
  if (event.target.id === 'reply'){

    // Extract  parameters of recieved letter
    const content = event.target.parentElement.parentElement.lastChild.innerHTML;
    const header = event.target.parentElement.parentElement.firstChild.innerHTML;
    
    const header_values = [];

    for (let i=0; i<4; i++){
      let raw_header_value=header.split('<br>')[i];
      let index=raw_header_value.lastIndexOf('>')+1;
      header_values[i]=raw_header_value.slice(index);
    }

    // Pre-fill form fields
    document.querySelector('#compose-recipients').value = header_values[0];

    if(!header_values[2].startsWith('Re: ')){
      header_values[2] = 'Re: '+ header_values[2]
    }

    document.querySelector('#compose-subject').value =  header_values[2];

    const prefix ='On '+ header_values[3] + ' '+ header_values[0] +'wrote:\n ';

    // Pre-fill textarea
    document.querySelector('#compose-body').value = prefix + content;

  } else {
      // Clear out composition fields while writing a new letter
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }

  // Send composed email to API
  document.querySelector('#compose-form').addEventListener('submit', send_email); 
}

function send_email(event){

  // Prevent default page reloading after form submiting 
  event.preventDefault();
  const content_to_send = document.querySelector('#compose-body').value;

  // Send form data submitted to API
  fetch('emails',{
    'method':'POST',
    'body':JSON.stringify({
      'recipients':document.querySelector('#compose-recipients').value,
      'subject':document.querySelector('#compose-subject').value,
      'body': content_to_send,
    })
  })
  .then(response => response.json())
  .then(result => report(result));
}

function report(result){

  // Message div  for delivery report created and appended 
  const message_div = document.createElement('div');
  message_div.setAttribute('id','message-div');
  document.querySelector('#compose-view').append(message_div); 
  message_div.innerHTML = '<div id = "message_text"  class="centered-element"></div>'
  document.querySelector('#message_text').innerHTML = (result.message || result.error);

  if ((result.message || result.error).startsWith('E') ){
    message_div.setAttribute('class','message success');

    // To prevent resubmission
    document.querySelector('#compose-form').removeEventListener('submit', send_email); 

  } else {
    message_div.setAttribute('class','message fail');
  } 
  
  message_div.firstChild.addEventListener('click',set_message_invisible);
  setTimeout(erase_message, 3000);
}

function erase_message() {
  const message_div = document.querySelector('#message-div');

  // if successfully sent
  if(message_div.firstChild.innerHTML.startsWith('E')){
    load_mailbox('sent');
  }

  message_div.remove();
}

function set_message_invisible(event){

  const message_div = event.target.parentElement;

  if(event.target.innerHTML.startsWith('E')){
    message_div.style.display = 'none';
    load_mailbox('sent');
  } else {
    message_div.style.display = 'none';
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase()
                                                     + mailbox.slice(1)}</h3>`;
   
  // Create and append the frame for letters' list                                                  
  const overflow_div = document.createElement ('div');
  overflow_div.setAttribute('class','overflow height1');
  document.querySelector('#emails-view').append(overflow_div);                                         

  // Fetch emails from specific mailbox
  fetch('emails/'+mailbox)
  .then(response => response.json())
  .then(emails => show_emails(emails,mailbox,overflow_div))
}


function show_emails(emails, mailbox, overflow_div){

  for (let email of emails){
    
    // Create div for every single letter 
    const element = document.createElement ('div');
    element.setAttribute('id',`${email.id}`);
  
    if(email.read){
      element.className = 'read email';
    } else {
      element.className = 'not_read email';
    }

    let first_col;

    if (mailbox !== 'sent'){
      first_col = email.sender;
    } else {
      first_col = 'To: '+ email.recipients.join(', ');
    }

    element.innerHTML =`<div class="row"> 
                            <div class='col-4 bold wrap'> ${first_col} </div>
                            <div class='col-5 wrap'> ${email.subject} </div>
                            <div class='col-3 timestamp'> ${email.timestamp} </div>
                        </div>`;
    
    element.addEventListener('click', show_email)
    overflow_div.append(element);
  }
}

function show_email(event){

  // Show the specific email and hide other views
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Find what mailbox the email is from - works either index-1 or index-2 or index -3 variant - it depends on exact click point
  const mailbox1 = event.target.parentElement.parentElement.parentElement.parentElement.firstChild.innerHTML;
  const email_id1 = event.target.parentElement.parentElement.id;
  const email_id2 = event.target.id;
  const email_id3 = event.target.parentElement.id;
  const mailbox2 = event.target.parentElement.parentElement.firstChild.innerHTML;
  const mailbox3 = event.target.parentElement.parentElement.parentElement.firstChild.innerHTML;
  

  if (['Inbox','Sent','Archive'].includes(mailbox2)){
    var mailbox_ = mailbox2;
    var email_id_ = email_id2;
  } else if (['Inbox','Sent','Archive'].includes(mailbox1)){
    var mailbox_ = mailbox1;
    var email_id_ = email_id1;
  } else {
    var mailbox_ = mailbox3;
    var email_id_ = email_id3;
  }

  // Clear out the previous content
  document.querySelector('#email-view').innerHTML = ''

  // Create and append divs for email components
  const header_div = document.createElement('div');
  const button_div = document.createElement('div');
  const hr_div = document.createElement('div');
  const body_div = document.createElement('div');

  hr_div.innerHTML='<hr>';
  
  document.querySelector("#email-view").appendChild(header_div);
  document.querySelector("#email-view").appendChild(button_div);
  document.querySelector("#email-view").appendChild(hr_div);
  document.querySelector("#email-view").appendChild(body_div);


  // Presenting Archive and Reply buttons
  if (mailbox_ === 'Sent'){
    button_div.style.display = 'none';
  } else {
    button_div.setAttribute('id','button_div');  

    const reply_button_html = '<button id="reply" class ="btn btn-sm btn-outline-primary"> Reply </button>';

    if(mailbox_ === 'Inbox'){
      document.querySelector(
        "#button_div").innerHTML=('<button class ="btn btn-sm btn-outline-primary button"> Archive </button>'
                                  +reply_button_html);
    } else {
      document.querySelector(
        "#button_div").innerHTML=('<button class ="btn btn-sm btn-outline-primary button"> Unarchive </button>'
                                  + reply_button_html);
    }

    // Add Event Listener for Archive and Unarchive buttons
    document.querySelectorAll('.button').forEach(button=>{
      button.addEventListener('click',change_archive_status);
    });

    document.querySelector('#reply').addEventListener('click',compose_email);
  }

  // Fetch email with specific id 
  fetch('emails/'+email_id_)
  .then(response=>response.json())
  .then(email => {
    header_div.innerHTML = `<strong> From:&nbsp </strong> ${email.sender} <br>
                            <strong> To:&nbsp </strong> ${email.recipients.join(', ')} <br>
                            <strong> Subject:&nbsp </strong>${email.subject} <br>
                            <strong> Timestamp:&nbsp </strong> ${email.timestamp} <br> `;
    header_div.setAttribute('data-email_id',`${email.id}`);
    
    body_div.innerHTML = `${email.body}`;
    body_div.setAttribute('class','overflow height2 wrap');  
  });

  // Mark email as read
  fetch('emails/'+email_id_,{
    'method':"PUT",
    'body':JSON.stringify({
      read:true
    })
  })
}

function change_archive_status(event){

  // Extract email id and archive/unarchive choice from event object 
  const email_id=event.target.parentElement.parentElement.firstChild.dataset.email_id;
  const action_required = event.target.innerHTML;

  // For unarchive 
  let arc_status = false;

  // For archive
  if(action_required.trim() === 'Archive'){
    arc_status = true;
  } 

  // Update archive status
  fetch('emails/'+email_id,{
    method:'PUT',
    body: JSON.stringify({
      archived: arc_status
    })
  })

  // pause for 300 ms to give time for fetch to accomplish its work
  pause(300);

  load_mailbox('inbox');
}

function pause(delay) {
  const start_moment = Date.now();
  while(Date.now() < start_moment+delay){}
}
