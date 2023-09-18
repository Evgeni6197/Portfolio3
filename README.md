# EMAIL 

### 1.  [Video Demonstration 30 sec]( https://youtu.be/cjmCFZKSlng  )
   
### 2. Launching

   The procedure described below presumes that you are using Bash. 
   Inside an empty folder, run: 
   
   ```
   git clone https://github.com/Evgeni6197/Portfolio3.git
   cd Portfolio3
   python3 -m venv ./venv
   source venv/bin/activate
   python -m pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```
### 3. Content

  - User registration
  - One page app: Simulating email correspondence between registered users
    - Creating a new email
    - Managing mailboxes: Inbox, Sent, Archived
    - Viewing email content
    - Archiving and unarchiving emails
    - Replying and organizing chats

