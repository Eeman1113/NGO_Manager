import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import datetime
import os
import hashlib
import uuid
from PIL import Image
import io
import base64
from streamlit_option_menu import option_menu

# Set page configuration
st.set_page_config(
    page_title="NGO Volunteer Management",
    page_icon="🤝",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False
if "user_role" not in st.session_state:
    st.session_state.user_role = None
if "user_id" not in st.session_state:
    st.session_state.user_id = None
if "active_tab" not in st.session_state:
    st.session_state.active_tab = "Dashboard"
if "notifications" not in st.session_state:
    st.session_state.notifications = []

# Create database directories if they don't exist
if not os.path.exists('data'):
    os.makedirs('data')

# Initialize databases with sample data if they don't exist
if not os.path.exists('data/users.csv'):
    users_df = pd.DataFrame({
        'user_id': ['admin001', 'vol001', 'vol002'],
        'username': ['admin', 'john_doe', 'jane_smith'],
        'password': [
            hashlib.sha256('admin123'.encode()).hexdigest(),
            hashlib.sha256('password123'.encode()).hexdigest(),
            hashlib.sha256('password456'.encode()).hexdigest()
        ],
        'role': ['admin', 'volunteer', 'volunteer'],
        'name': ['Admin User', 'John Doe', 'Jane Smith'],
        'email': ['admin@ngo.org', 'john@example.com', 'jane@example.com'],
        'phone': ['9876543210', '9876543211', '9876543212'],
        'skills': ['management', 'teaching,coding', 'design,social media'],
        'domains': ['management', 'education,technology', 'creative,social media'],
        'availability': ['weekdays', 'weekends', 'evenings'],
        'aadhar_verified': [True, False, True],
        'aadhar_image': ['', '', ''],
        'status': ['active', 'active', 'active'],
        'join_date': ['2023-01-01', '2023-02-15', '2023-03-20'],
        'birthday': ['1990-05-15', '1995-07-22', '1992-11-30']
    })
    users_df.to_csv('data/users.csv', index=False)

if not os.path.exists('data/tasks.csv'):
    tasks_df = pd.DataFrame({
        'task_id': ['task001', 'task002', 'task003'],
        'title': ['Website Update', 'Social Media Campaign', 'Community Outreach'],
        'description': [
            'Update the NGO website with recent activities',
            'Create posts for Facebook and Instagram',
            'Organize community awareness program'
        ],
        'assigned_to': ['vol001', 'vol002', ''],
        'status': ['in progress', 'pending', 'unassigned'],
        'due_date': ['2025-04-15', '2025-04-10', '2025-04-20'],
        'domain': ['technology', 'social media', 'on-ground'],
        'priority': ['medium', 'high', 'low'],
        'created_by': ['admin001', 'admin001', 'admin001'],
        'created_date': ['2025-03-20', '2025-03-22', '2025-03-23']
    })
    tasks_df.to_csv('data/tasks.csv', index=False)

if not os.path.exists('data/events.csv'):
    events_df = pd.DataFrame({
        'event_id': ['evt001', 'evt002'],
        'title': ['Annual Fundraiser', 'Community Workshop'],
        'description': [
            'Annual fundraising event for the NGO',
            'Workshop on environmental awareness'
        ],
        'date': ['2025-05-15', '2025-04-25'],
        'time': ['18:00:00', '10:00:00'],
        'location': ['Community Hall, City Center', 'Public Park, West Side'],
        'coordinator': ['admin001', 'vol002'],
        'participants': ['vol001,vol002', 'vol001'],
        'status': ['upcoming', 'upcoming'],
        'created_by': ['admin001', 'admin001'],
        'created_date': ['2025-03-15', '2025-03-18']
    })
    events_df.to_csv('data/events.csv', index=False)

if not os.path.exists('data/attendance.csv'):
    attendance_df = pd.DataFrame({
        'record_id': ['att001', 'att002'],
        'event_id': ['evt001', 'evt001'],
        'user_id': ['vol001', 'vol002'],
        'status': ['confirmed', 'confirmed'],
        'check_in': ['', ''],
        'check_out': ['', ''],
        'tasks': ['registration,setup', 'social media coverage']
    })
    attendance_df.to_csv('data/attendance.csv', index=False)

if not os.path.exists('data/ideas.csv'):
    ideas_df = pd.DataFrame({
        'idea_id': ['idea001', 'idea002'],
        'title': ['Online Donation Platform', 'Monthly Newsletter'],
        'description': [
            'Create an online platform for donations',
            'Start a monthly newsletter for supporters'
        ],
        'submitted_by': ['vol001', 'vol002'],
        'status': ['under review', 'approved'],
        'submission_date': ['2025-03-10', '2025-03-05'],
        'comments': ['Sounds promising', 'Great idea, will implement']
    })
    ideas_df.to_csv('data/ideas.csv', index=False)

# Load data
@st.cache_data(ttl=60)
def load_data():
    users = pd.read_csv('data/users.csv')
    tasks = pd.read_csv('data/tasks.csv')
    events = pd.read_csv('data/events.csv')
    attendance = pd.read_csv('data/attendance.csv')
    ideas = pd.read_csv('data/ideas.csv')
    return users, tasks, events, attendance, ideas

# Authentication functions
def authenticate(username, password):
    users, _, _, _, _ = load_data()
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    user = users[(users['username'] == username) & (users['password'] == hashed_password)]
    if not user.empty:
        st.session_state.authenticated = True
        st.session_state.user_role = user['role'].values[0]
        st.session_state.user_id = user['user_id'].values[0]
        return True
    return False

def logout():
    st.session_state.authenticated = False
    st.session_state.user_role = None
    st.session_state.user_id = None
    st.session_state.active_tab = "Dashboard"

# Layout functions
def show_login():
    st.title("🤝 NGO Volunteer Management Platform")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.write("### Login")
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        login_button = st.button("Login")
        
        if login_button:
            if authenticate(username, password):
                st.rerun()
            else:
                st.error("Invalid username or password")
    
    with col2:
        st.write("### Register")
        with st.expander("Click to register as a new volunteer"):
            reg_name = st.text_input("Full Name")
            reg_email = st.text_input("Email")
            reg_phone = st.text_input("Phone Number")
            reg_username = st.text_input("Choose Username")
            reg_password = st.text_input("Choose Password", type="password")
            reg_skills = st.multiselect(
                "Select Skills", 
                ["Teaching", "Coding", "Design", "Social Media", "Writing", "Event Management", "Fundraising", "Leadership"]
            )
            reg_domains = st.multiselect(
                "Interested Domains", 
                ["Education", "Technology", "Creative", "Social Media", "On-ground support", "Management", "Fundraising"]
            )
            reg_availability = st.multiselect(
                "Availability", 
                ["Weekdays", "Weekends", "Evenings", "Mornings"]
            )
            reg_birthday = st.date_input("Birthday", datetime.date(2000, 1, 1))
            aadhar_upload = st.file_uploader("Upload Aadhar Card (for verification)", type=["jpg", "jpeg", "png", "pdf"])
            
            if st.button("Register"):
                if reg_name and reg_email and reg_phone and reg_username and reg_password:
                    users, _, _, _, _ = load_data()
                    if reg_username in users['username'].values:
                        st.error("Username already exists. Please choose another.")
                    else:
                        # Save Aadhar image if uploaded
                        aadhar_image_data = ""
                        if aadhar_upload:
                            file_bytes = aadhar_upload.getvalue()
                            aadhar_image_data = base64.b64encode(file_bytes).decode()
                        
                        # Create new user
                        new_user = pd.DataFrame({
                            'user_id': [f"vol{str(uuid.uuid4())[:6]}"],
                            'username': [reg_username],
                            'password': [hashlib.sha256(reg_password.encode()).hexdigest()],
                            'role': ['volunteer'],
                            'name': [reg_name],
                            'email': [reg_email],
                            'phone': [reg_phone],
                            'skills': [','.join(reg_skills).lower()],
                            'domains': [','.join(reg_domains).lower()],
                            'availability': [','.join(reg_availability).lower()],
                            'aadhar_verified': [False],
                            'aadhar_image': [aadhar_image_data],
                            'status': ['active'],
                            'join_date': [datetime.date.today().strftime('%Y-%m-%d')],
                            'birthday': [reg_birthday.strftime('%Y-%m-%d')]
                        })
                        
                        users = pd.concat([users, new_user], ignore_index=True)
                        users.to_csv('data/users.csv', index=False)
                        st.success("Registration successful! You can now login.")
                else:
                    st.warning("Please fill all required fields.")

def show_main_interface():
    users, tasks, events, attendance, ideas = load_data()
    
    # Get current user information
    current_user = users[users['user_id'] == st.session_state.user_id].iloc[0]
    
    # Sidebar navigation
    with st.sidebar:
        st.title(f"Welcome, {current_user['name']}")
        st.write(f"Role: {current_user['role'].capitalize()}")
        
        if st.session_state.user_role == 'admin':
            selected = option_menu(
                "Main Menu", 
                ["Dashboard", "Members", "Tasks", "Events", "Aadhaar Verification", "Ideas", "Analytics", "Settings"],
                icons=['house', 'people', 'list-task', 'calendar-event', 'card-checklist', 'lightbulb', 'graph-up', 'gear'],
                menu_icon="cast", 
                default_index=0,
            )
        else:
            selected = option_menu(
                "Main Menu", 
                ["Dashboard", "My Profile", "My Tasks", "Events", "Submit Idea"],
                icons=['house', 'person', 'list-task', 'calendar-event', 'lightbulb'],
                menu_icon="cast", 
                default_index=0,
            )
        
        st.session_state.active_tab = selected
        
        if st.button("Logout"):
            logout()
            st.rerun()
    
    # Main content
    if st.session_state.active_tab == "Dashboard":
        show_dashboard(users, tasks, events, ideas)
    
    elif st.session_state.active_tab == "Members" and st.session_state.user_role == 'admin':
        show_members(users)
    
    elif st.session_state.active_tab == "My Profile" and st.session_state.user_role == 'volunteer':
        show_profile(current_user)
    
    elif st.session_state.active_tab == "Tasks" and st.session_state.user_role == 'admin':
        show_tasks_admin(tasks, users)
    
    elif st.session_state.active_tab == "My Tasks" and st.session_state.user_role == 'volunteer':
        show_tasks_volunteer(tasks)
    
    elif st.session_state.active_tab == "Events":
        show_events(events, users, attendance)
    
    elif st.session_state.active_tab == "Aadhaar Verification" and st.session_state.user_role == 'admin':
        show_aadhar_verification(users)
    
    elif st.session_state.active_tab == "Ideas" and st.session_state.user_role == 'admin':
        show_ideas_admin(ideas, users)
    
    elif st.session_state.active_tab == "Submit Idea" and st.session_state.user_role == 'volunteer':
        show_submit_idea(ideas)
    
    elif st.session_state.active_tab == "Analytics" and st.session_state.user_role == 'admin':
        show_analytics(users, tasks, events, attendance, ideas)
    
    elif st.session_state.active_tab == "Settings":
        show_settings(current_user)

def show_dashboard(users, tasks, events, ideas):
    st.title("📊 Dashboard")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Total Members", len(users))
    
    with col2:
        active_tasks = len(tasks[tasks['status'] != 'completed'])
        st.metric("Active Tasks", active_tasks)
    
    with col3:
        upcoming_events = len(events[events['status'] == 'upcoming'])
        st.metric("Upcoming Events", upcoming_events)
    
    # Different dashboard content based on role
    if st.session_state.user_role == 'admin':
        st.subheader("Quick Actions")
        
        quick_col1, quick_col2, quick_col3 = st.columns(3)
        
        with quick_col1:
            if st.button("Create New Task"):
                st.session_state.active_tab = "Tasks"
                st.rerun()
                
        with quick_col2:
            if st.button("Create New Event"):
                st.session_state.active_tab = "Events"
                st.rerun()
                
        with quick_col3:
            if st.button("Verify Members"):
                st.session_state.active_tab = "Aadhaar Verification"
                st.rerun()
        
        # Today's birthdays
        today = datetime.date.today().strftime("%m-%d")
        birthdays_today = users[users['birthday'].str[5:].str.replace('-', '') == today.replace('-', '')]
        
        if not birthdays_today.empty:
            st.subheader("🎂 Today's Birthdays")
            for _, user in birthdays_today.iterrows():
                st.info(f"🎉 It's {user['name']}'s birthday today!")
        
        # Recent activities
        st.subheader("Recent Activities")
        
        # Recent tasks
        recent_tasks = tasks.sort_values('created_date', ascending=False).head(3)
        st.write("Recent Tasks:")
        for _, task in recent_tasks.iterrows():
            st.write(f"- **{task['title']}** ({task['status']}) - Due: {task['due_date']}")
        
        # Recent ideas
        recent_ideas = ideas.sort_values('submission_date', ascending=False).head(3)
        st.write("Recent Ideas:")
        for _, idea in recent_ideas.iterrows():
            submitter = users[users['user_id'] == idea['submitted_by']]['name'].values[0]
            st.write(f"- **{idea['title']}** by {submitter} - Status: {idea['status']}")
    
    else:  # Volunteer dashboard
        # My upcoming tasks
        my_tasks = tasks[tasks['assigned_to'] == st.session_state.user_id]
        upcoming_tasks = my_tasks[my_tasks['status'] != 'completed'].sort_values('due_date')
        
        st.subheader("My Upcoming Tasks")
        if not upcoming_tasks.empty:
            for _, task in upcoming_tasks.iterrows():
                days_left = (datetime.datetime.strptime(task['due_date'], '%Y-%m-%d').date() - datetime.date.today()).days
                if days_left < 0:
                    st.error(f"⚠️ **{task['title']}** - Overdue by {abs(days_left)} days")
                elif days_left == 0:
                    st.warning(f"⏰ **{task['title']}** - Due today!")
                else:
                    st.info(f"📝 **{task['title']}** - Due in {days_left} days")
        else:
            st.write("You have no upcoming tasks.")
        
        # My upcoming events
        my_events = []
        for _, event in events.iterrows():
            participants = str(event['participants']).split(',')
            if st.session_state.user_id in participants:
                my_events.append(event)
        
        if my_events:
            st.subheader("My Upcoming Events")
            for event in my_events:
                event_date = datetime.datetime.strptime(event['date'], '%Y-%m-%d').date()
                if event_date >= datetime.date.today():
                    st.info(f"📅 **{event['title']}** - {event['date']} at {event['time']}")
        else:
            st.subheader("My Upcoming Events")
            st.write("You have no upcoming events.")
        
        # My submitted ideas
        my_ideas = ideas[ideas['submitted_by'] == st.session_state.user_id]
        if not my_ideas.empty:
            st.subheader("My Ideas")
            for _, idea in my_ideas.iterrows():
                st.write(f"- **{idea['title']}** - Status: {idea['status']}")
                if idea['comments']:
                    st.write(f"  Comment: {idea['comments']}")

def show_members(users):
    st.title("👥 Members & Volunteers")
    
    # Filters
    col1, col2, col3 = st.columns(3)
    with col1:
        status_filter = st.selectbox("Filter by Status", ["All", "Active", "Inactive"])
    with col2:
        domain_filter = st.selectbox("Filter by Domain", ["All"] + sorted(list(set(",".join(users['domains'].fillna("")).split(",")))))
    with col3:
        search_term = st.text_input("Search by Name or Email")
    
    # Apply filters
    filtered_users = users.copy()
    
    if status_filter != "All":
        filtered_users = filtered_users[filtered_users['status'].str.lower() == status_filter.lower()]
    
    if domain_filter != "All" and domain_filter:
        filtered_users = filtered_users[filtered_users['domains'].str.contains(domain_filter.lower(), na=False)]
    
    if search_term:
        filtered_users = filtered_users[
            filtered_users['name'].str.contains(search_term, case=False, na=False) | 
            filtered_users['email'].str.contains(search_term, case=False, na=False)
        ]
    
    # Add new member button
    if st.button("Add New Member"):
        st.session_state.adding_member = True
    
    # Add new member form
    if 'adding_member' in st.session_state and st.session_state.adding_member:
        st.subheader("Add New Member")
        with st.form("add_member_form"):
            name = st.text_input("Full Name")
            email = st.text_input("Email")
            phone = st.text_input("Phone Number")
            username = st.text_input("Username")
            password = st.text_input("Password", type="password")
            role = st.selectbox("Role", ["volunteer", "admin"])
            skills = st.multiselect(
                "Skills", 
                ["Teaching", "Coding", "Design", "Social Media", "Writing", "Event Management", "Fundraising", "Leadership"]
            )
            domains = st.multiselect(
                "Domains", 
                ["Education", "Technology", "Creative", "Social Media", "On-ground support", "Management", "Fundraising"]
            )
            availability = st.multiselect(
                "Availability", 
                ["Weekdays", "Weekends", "Evenings", "Mornings"]
            )
            birthday = st.date_input("Birthday", datetime.date(2000, 1, 1))
            
            submitted = st.form_submit_button("Save Member")
            if submitted:
                if name and email and username and password:
                    if username in users['username'].values:
                        st.error("Username already exists. Please choose another.")
                    else:
                        new_user = pd.DataFrame({
                            'user_id': [f"{role[:3]}{str(uuid.uuid4())[:6]}"],
                            'username': [username],
                            'password': [hashlib.sha256(password.encode()).hexdigest()],
                            'role': [role],
                            'name': [name],
                            'email': [email],
                            'phone': [phone],
                            'skills': [','.join(skills).lower()],
                            'domains': [','.join(domains).lower()],
                            'availability': [','.join(availability).lower()],
                            'aadhar_verified': [False],
                            'aadhar_image': [''],
                            'status': ['active'],
                            'join_date': [datetime.date.today().strftime('%Y-%m-%d')],
                            'birthday': [birthday.strftime('%Y-%m-%d')]
                        })
                        
                        all_users = pd.concat([users, new_user], ignore_index=True)
                        all_users.to_csv('data/users.csv', index=False)
                        st.success("Member added successfully!")
                        st.session_state.adding_member = False
                        st.rerun()
                else:
                    st.warning("Please fill all required fields.")
        
        if st.button("Cancel"):
            st.session_state.adding_member = False
            st.rerun()
    
    # Display members
    st.subheader("Members List")
    if filtered_users.empty:
        st.write("No members found matching the criteria.")
    else:
        for i, user in filtered_users.iterrows():
            with st.expander(f"{user['name']} - {user['role'].capitalize()} ({user['status'].capitalize()})"):
                col1, col2 = st.columns(2)
                
                with col1:
                    st.write(f"**Email:** {user['email']}")
                    st.write(f"**Phone:** {user['phone']}")
                    st.write(f"**Join Date:** {user['join_date']}")
                    skills = user['skills'].split(',') if pd.notna(user['skills']) else []
                    st.write(f"**Skills:** {', '.join([s.capitalize() for s in skills])}")
                
                with col2:
                    domains = user['domains'].split(',') if pd.notna(user['domains']) else []
                    st.write(f"**Domains:** {', '.join([d.capitalize() for d in domains])}")
                    availability = user['availability'].split(',') if pd.notna(user['availability']) else []
                    st.write(f"**Availability:** {', '.join([a.capitalize() for a in availability])}")
                    st.write(f"**Aadhaar Verified:** {'Yes' if user['aadhar_verified'] else 'No'}")
                    st.write(f"**Birthday:** {user['birthday']}")
                
                # Actions
                action_col1, action_col2, action_col3 = st.columns(3)
                
                with action_col1:
                    new_status = "Inactive" if user['status'].lower() == "active" else "Active"
                    if st.button(f"Mark {new_status}", key=f"status_{i}"):
                        users.at[i, 'status'] = new_status.lower()
                        users.to_csv('data/users.csv', index=False)
                        st.success(f"User marked as {new_status}")
                        st.rerun()
                
                with action_col2:
                    if st.button("Edit User", key=f"edit_{i}"):
                        st.session_state.editing_user = i
                        st.session_state.editing_user_id = user['user_id']
                
                with action_col3:
                    if st.button("Delete User", key=f"delete_{i}"):
                        if st.session_state.user_id != user['user_id']:  # Prevent self-deletion
                            users = users.drop(i)
                            users.to_csv('data/users.csv', index=False)
                            st.success("User deleted successfully!")
                            st.rerun()
                        else:
                            st.error("You cannot delete your own account!")
                
                # Show edit form if editing this user
                if 'editing_user' in st.session_state and st.session_state.editing_user == i:
                    st.subheader("Edit User")
                    with st.form(f"edit_user_form_{i}"):
                        edit_name = st.text_input("Full Name", user['name'])
                        edit_email = st.text_input("Email", user['email'])
                        edit_phone = st.text_input("Phone Number", user['phone'])
                        
                        current_skills = user['skills'].split(',') if pd.notna(user['skills']) else []
                        edit_skills = st.multiselect(
                            "Skills", 
                            ["Teaching", "Coding", "Design", "Social Media", "Writing", "Event Management", "Fundraising", "Leadership"],
                            default=[s.capitalize() for s in current_skills]
                        )
                        
                        current_domains = user['domains'].split(',') if pd.notna(user['domains']) else []
                        edit_domains = st.multiselect(
                            "Domains", 
                            ["Education", "Technology", "Creative", "Social Media", "On-ground support", "Management", "Fundraising"],
                            default=[d.capitalize() for d in current_domains]
                        )
                        
                        current_availability = user['availability'].split(',') if pd.notna(user['availability']) else []
                        edit_availability = st.multiselect(
                            "Availability", 
                            ["Weekdays", "Weekends", "Evenings", "Mornings"],
                            default=[a.capitalize() for a in current_availability]
                        )
                        
                        edit_birthday = st.date_input("Birthday", datetime.datetime.strptime(user['birthday'], '%Y-%m-%d').date())
                        edit_role = st.selectbox("Role", ["volunteer", "admin"], index=0 if user['role'] == "volunteer" else 1)
                        
                        update_submitted = st.form_submit_button("Update User")
                        if update_submitted:
                            users.at[i, 'name'] = edit_name
                            users.at[i, 'email'] = edit_email
                            users.at[i, 'phone'] = edit_phone
                            users.at[i, 'skills'] = ','.join([s.lower() for s in edit_skills])
                            users.at[i, 'domains'] = ','.join([d.lower() for d in edit_domains])
                            users.at[i, 'availability'] = ','.join([a.lower() for a in edit_availability])
                            users.at[i, 'birthday'] = edit_birthday.strftime('%Y-%m-%d')
                            users.at[i, 'role'] = edit_role
                            
                            users.to_csv('data/users.csv', index=False)
                            st.success("User updated successfully!")
                            st.session_state.editing_user = None
                            st.rerun()
                    
                    if st.button("Cancel Editing"):
                        st.session_state.editing_user = None
                        st.rerun()

def show_profile(current_user):
    st.title("👤 My Profile")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        # Display user avatar
        st.image("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png", width=150)
        st.write(f"**{current_user['name']}**")
        st.write(f"Member since: {current_user['join_date']}")
        
        # Verification badge
        if current_user['aadhar_verified']:
            st.success("✅ Verified Member")
        else:
            st.warning("⚠️ Verification Pending")
    
    with col2:
        st.subheader("Personal Information")
        st.write(f"**Email:** {current_user['email']}")
        st.write(f"**Phone:** {current_user['phone']}")
        st.write(f"**Birthday:** {current_user['birthday']}")
        
        # Skills and domains
        st.subheader("Skills & Interests")
        
        skills = current_user['skills'].split(',') if pd.notna(current_user['skills']) else []
        domains = current_user['domains'].split(',') if pd.notna(current_user['domains']) else []
        availability = current_user['availability'].split(',') if pd.notna(current_user['availability']) else []
        
        st.write(f"**Skills:** {', '.join([s.capitalize() for s in skills])}")
        st.write(f"**Domains:** {', '.join([d.capitalize() for d in domains])}")
        st.write(f"**Availability:** {', '.join([a.capitalize() for a in availability])}")
    
    # Edit profile
    st.subheader("Update Profile")
    with st.form("update_profile_form"):
        update_name = st.text_input("Full Name", current_user['name'])
        update_email = st.text_input("Email", current_user['email'])
        update_phone = st.text_input("Phone Number", current_user['phone'])
        
        current_skills = current_user['skills'].split(',') if pd.notna(current_user['skills']) else []
        update_skills = st.multiselect(
            "Skills", 
            ["Teaching", "Coding", "Design", "Social Media", "Writing", "Event Management", "Fundraising", "Leadership"],
            default=[s.capitalize() for s in current_skills]
        )
        
        current_domains = current_user['domains'].split(',') if pd.notna(current_user['domains']) else []
        update_domains = st.multiselect(
            "Domains", 
            ["Education", "Technology", "Creative", "Social Media", "On-ground support", "Management", "Fundraising"],
            default=[d.capitalize() for d in current_domains]
        )
        
        current_availability = current_user['availability'].split(',') if pd.notna(current_user['availability']) else []
        update_availability = st.multiselect(
            "Availability", 
            ["Weekdays", "Weekends", "Evenings", "Mornings"],
            default=[a.capitalize() for a in current_availability]
        )
        
        update_password = st.text_input("New Password (leave blank to keep current)", type="password")
        
        # Option to re-upload Aadhar if not verified
        if not current_user['aadhar_verified']:
            aadhar_upload = st.file_uploader("Upload Aadhar Card for Verification", type=["jpg", "jpeg", "png", "pdf"])
        else:
            aadhar_upload = None
        
        update_submitted = st.form_submit_button("Update Profile")
        
        if update_submitted:
            users, _, _, _, _ = load_data()
            idx = users.index[users['user_id'] == current_user['user_id']].tolist()[0]
            
            users.at[idx, 'name'] = update_name
            users.at[idx, 'email'] = update_email
            users.at[idx, 'phone'] = update_phone
            users.at[idx, 'skills'] = ','.join([s.lower() for s in update_skills])
            users.at[idx, 'domains'] = ','.join([d.lower() for d in update_domains])
            users.at[idx, 'availability'] = ','.join([a.lower() for a in update_availability])
            
            if update_password:
                users.at[idx, 'password'] = hashlib.sha256(update_password.encode()).hexdigest()
            
            if aadhar_upload:
                file_bytes = aadhar_upload.getvalue()
                users.at[idx, 'aadhar_image'] = base64.b64encode(file_bytes).decode()
            
            users.to_csv('data/users.csv', index=False)
            st.success("Profile updated successfully!")
            st.rerun()

def show_tasks_admin(tasks, users):
    st.title("📋 Task Management")
    
    # Task filters
    col1, col2, col3 = st.columns(3)
    with col1:
        status_filter = st.selectbox("Filter by Status", ["All", "Unassigned", "Pending", "In Progress", "Completed"])
    with col2:
        domain_filter = st.selectbox("Filter by Domain", ["All"] + sorted(list(set(tasks['domain'].dropna()))))
    with col3:
        priority_filter = st.selectbox("Filter by Priority", ["All", "Low", "Medium", "High"])
    
    # Apply filters
    filtered_tasks = tasks.copy()
    
    if status_filter != "All":
        if status_filter == "Unassigned":
            filtered_tasks = filtered_tasks[filtered_tasks['assigned_to'] == ""]
        else:
            filtered_tasks = filtered_tasks[filtered_tasks['status'].str.lower() == status_filter.lower()]
    
    if domain_filter != "All":
        filtered_tasks = filtered_tasks[filtered_tasks['domain'] == domain_filter]
    
    if priority_filter != "All":
        filtered_tasks = filtered_tasks[filtered_tasks['priority'].str.lower() == priority_filter.lower()]
    
    # Create new task button
    if st.button("Create New Task"):
        st.session_state.creating_task = True
    
    # Create new task form
    if 'creating_task' in st.session_state and st.session_state.creating_task:
        st.subheader("Create New Task")
        with st.form("create_task_form"):
            task_title = st.text_input("Task Title")
            task_description = st.text_area("Task Description")
            task_domain = st.selectbox("Domain", ["Technology", "Social Media", "Education", "Creative", "On-ground", "Management", "Fundraising"])
            task_priority = st.selectbox("Priority", ["Low", "Medium", "High"])
            task_due_date = st.date_input("Due Date", datetime.date.today() + datetime.timedelta(days=7))
            
            # Smart matching or manual assignment
            assignment_method = st.radio("Assignment Method", ["Smart Match", "Manual Assignment"])
            
            if assignment_method == "Smart Match":
                st.info("Task will be automatically assigned to the best-matching volunteer based on skills, domain interests, and availability.")
                volunteer_id = ""
            else:
                # Get volunteers (not admins)
                volunteers = users[users['role'] == 'volunteer']
                volunteer_options = [(user['user_id'], f"{user['name']} ({user['email']})") for _, user in volunteers.iterrows()]
                volunteer_options.insert(0, ("", "Unassigned"))
                
                volunteer_dict = dict(volunteer_options)
                selected_vol = st.selectbox("Assign to Volunteer", options=list(volunteer_dict.keys()), format_func=lambda x: volunteer_dict.get(x))
                volunteer_id = selected_vol
            
            submitted = st.form_submit_button("Create Task")
            if submitted:
                if task_title and task_description:
                    # Implement smart matching if selected
                    if assignment_method == "Smart Match":
                        volunteer_id = smart_match_volunteer(users, task_domain, task_priority)
                    
                    # Create new task
                    new_task = pd.DataFrame({
                        'task_id': [f"task{str(uuid.uuid4())[:6]}"],
                        'title': [task_title],
                        'description': [task_description],
                        'assigned_to': [volunteer_id],
                        'status': ['unassigned' if volunteer_id == "" else 'pending'],
                        'due_date': [task_due_date.strftime('%Y-%m-%d')],
                        'domain': [task_domain.lower()],
                        'priority': [task_priority.lower()],
                        'created_by': [st.session_state.user_id],
                        'created_date': [datetime.date.today().strftime('%Y-%m-%d')]
                    })
                    
                    all_tasks = pd.concat([tasks, new_task], ignore_index=True)
                    all_tasks.to_csv('data/tasks.csv', index=False)
                    st.success("Task created successfully!")
                    st.session_state.creating_task = False
                    st.rerun()
                else:
                    st.warning("Please fill all required fields.")
        
        if st.button("Cancel"):
            st.session_state.creating_task = False
            st.rerun()
    
    # Display tasks
    st.subheader("Tasks List")
    if filtered_tasks.empty:
        st.write("No tasks found matching the criteria.")
    else:
        # Sort tasks by due date (ascending) and priority (high to low)
        filtered_tasks = filtered_tasks.sort_values(['due_date', 'priority'], 
                                                  ascending=[True, False])
        
        for i, task in filtered_tasks.iterrows():
            task_color = ""
            if task['priority'] == 'high':
                task_color = "🔴"
            elif task['priority'] == 'medium':
                task_color = "🟠"
            else:
                task_color = "🟢"
            
            # Format title based on status and priority
            title_text = f"{task_color} {task['title']} ({task['status'].capitalize()})"
            
            with st.expander(title_text):
                col1, col2 = st.columns(2)
                
                with col1:
                    st.write(f"**Description:** {task['description']}")
                    st.write(f"**Domain:** {task['domain'].capitalize()}")
                    st.write(f"**Priority:** {task['priority'].capitalize()}")
                
                with col2:
                    st.write(f"**Due Date:** {task['due_date']}")
                    
                    # Show assignee name if assigned
                    if task['assigned_to']:
                        assignee = users[users['user_id'] == task['assigned_to']]
                        if not assignee.empty:
                            st.write(f"**Assigned to:** {assignee.iloc[0]['name']}")
                        else:
                            st.write("**Assigned to:** Unknown User")
                    else:
                        st.write("**Assigned to:** Unassigned")
                    
                    st.write(f"**Created On:** {task['created_date']}")
                
                # Task actions
                action_col1, action_col2, action_col3 = st.columns(3)
                
                with action_col1:
                    if st.button("Reassign Task", key=f"reassign_{i}"):
                        st.session_state.reassigning_task = i
                        st.session_state.reassigning_task_id = task['task_id']
                
                with action_col2:
                    status_options = {
                        'unassigned': 'Mark as Pending',
                        'pending': 'Mark as In Progress',
                        'in progress': 'Mark as Completed', 
                        'completed': 'Reopen Task'
                    }
                    
                    next_status = status_options.get(task['status'].lower(), 'Update Status')
                    
                    if st.button(next_status, key=f"status_{i}"):
                        new_status_map = {
                            'unassigned': 'pending',
                            'pending': 'in progress',
                            'in progress': 'completed', 
                            'completed': 'pending'
                        }
                        
                        tasks.at[i, 'status'] = new_status_map.get(task['status'].lower(), task['status'])
                        tasks.to_csv('data/tasks.csv', index=False)
                        st.success(f"Task status updated to {new_status_map.get(task['status'].lower(), task['status']).capitalize()}")
                        st.rerun()
                
                with action_col3:
                    if st.button("Delete Task", key=f"delete_task_{i}"):
                        tasks = tasks.drop(i)
                        tasks.to_csv('data/tasks.csv', index=False)
                        st.success("Task deleted successfully!")
                        st.rerun()
                
                # Display reassignment form if selected
                if 'reassigning_task' in st.session_state and st.session_state.reassigning_task == i:
                    st.subheader("Reassign Task")
                    
                    # Get volunteers
                    volunteers = users[users['role'] == 'volunteer']
                    volunteer_options = [(user['user_id'], f"{user['name']} ({user['email']})") for _, user in volunteers.iterrows()]
                    volunteer_options.insert(0, ("", "Unassigned"))
                    
                    volunteer_dict = dict(volunteer_options)
                    
                    with st.form(f"reassign_task_form_{i}"):
                        selected_vol = st.selectbox("Select Volunteer", 
                                                    options=list(volunteer_dict.keys()),
                                                    format_func=lambda x: volunteer_dict.get(x),
                                                    index=list(volunteer_dict.keys()).index(task['assigned_to']) if task['assigned_to'] in volunteer_dict else 0)
                        
                        reassign_submitted = st.form_submit_button("Reassign")
                        if reassign_submitted:
                            tasks.at[i, 'assigned_to'] = selected_vol
                            
                            # Update status if assigning from unassigned
                            if task['status'].lower() == 'unassigned' and selected_vol:
                                tasks.at[i, 'status'] = 'pending'
                            
                            # If removing assignment, set status to unassigned
                            if not selected_vol:
                                tasks.at[i, 'status'] = 'unassigned'
                                
                            tasks.to_csv('data/tasks.csv', index=False)
                            st.success("Task reassigned successfully!")
                            st.session_state.reassigning_task = None
                            st.rerun()
                    
                    if st.button("Cancel Reassignment"):
                        st.session_state.reassigning_task = None
                        st.rerun()

# Smart matching algorithm for task assignments
def smart_match_volunteer(users, task_domain, task_priority):
    volunteers = users[users['role'] == 'volunteer'].copy()
    
    if volunteers.empty:
        return ""
    
    # Initialize scores
    volunteers['score'] = 0
    
    # Score based on domain match
    for i, volunteer in volunteers.iterrows():
        domains = str(volunteer['domains']).split(',') if pd.notna(volunteer['domains']) else []
        
        # Domain match (highest weight)
        if task_domain.lower() in domains:
            volunteers.at[i, 'score'] += 10
        
        # Skills relevance
        skills = str(volunteer['skills']).split(',') if pd.notna(volunteer['skills']) else []
        relevant_skills = {
            'technology': ['coding', 'design', 'teaching'],
            'social media': ['social media', 'writing', 'design'],
            'education': ['teaching', 'writing', 'leadership'],
            'creative': ['design', 'writing', 'social media'],
            'on-ground': ['leadership', 'event management'],
            'management': ['leadership', 'event management', 'fundraising'],
            'fundraising': ['fundraising', 'leadership', 'writing']
        }
        
        domain_relevant_skills = relevant_skills.get(task_domain.lower(), [])
        skill_matches = sum(1 for skill in skills if skill in domain_relevant_skills)
        volunteers.at[i, 'score'] += skill_matches * 2
        
        # Availability (moderate weight)
        # This is simplified, but could be expanded to check specific day availability
        availability = str(volunteer['availability']).split(',') if pd.notna(volunteer['availability']) else []
        if availability:
            volunteers.at[i, 'score'] += 3
        
        # Current workload consideration
        # In a real app, you'd check how many active tasks they have
        # Here we'll just use a random proxy for demonstration
        workload_penalty = np.random.randint(0, 5)  # Simulated current workload
        volunteers.at[i, 'score'] -= workload_penalty
        
        # Status consideration
        if volunteer['status'].lower() != 'active':
            volunteers.at[i, 'score'] = -100  # Ensure inactive volunteers aren't selected
        
        # Verification boost
        if volunteer['aadhar_verified']:
            volunteers.at[i, 'score'] += 2
    
    # Sort by score and pick the best match
    volunteers = volunteers.sort_values('score', ascending=False)
    
    if volunteers.empty or volunteers.iloc[0]['score'] <= 0:
        return ""  # No suitable match
    
    return volunteers.iloc[0]['user_id']

def show_tasks_volunteer(tasks):
    st.title("📋 My Tasks")
    
    # Get my tasks
    my_tasks = tasks[tasks['assigned_to'] == st.session_state.user_id].copy()
    
    # Task filters
    status_filter = st.selectbox("Filter by Status", ["All", "Pending", "In Progress", "Completed"])
    
    # Apply filters
    if status_filter != "All":
        my_tasks = my_tasks[my_tasks['status'].str.lower() == status_filter.lower()]
    
    # Display tasks
    if my_tasks.empty:
        st.write("You have no tasks matching the criteria.")
    else:
        # Sort tasks by due date and priority
        my_tasks = my_tasks.sort_values(['due_date', 'priority'], ascending=[True, False])
        
        for i, task in my_tasks.iterrows():
            task_color = ""
            if task['priority'] == 'high':
                task_color = "🔴"
            elif task['priority'] == 'medium':
                task_color = "🟠"
            else:
                task_color = "🟢"
            
            # Format title based on status and priority
            title_text = f"{task_color} {task['title']} ({task['status'].capitalize()})"
            
            with st.expander(title_text):
                st.write(f"**Description:** {task['description']}")
                st.write(f"**Domain:** {task['domain'].capitalize()}")
                st.write(f"**Priority:** {task['priority'].capitalize()}")
                st.write(f"**Due Date:** {task['due_date']}")
                
                # Days remaining calculation
                due_date = datetime.datetime.strptime(task['due_date'], '%Y-%m-%d').date()
                days_remaining = (due_date - datetime.date.today()).days
                
                if days_remaining < 0:
                    st.error(f"⚠️ Overdue by {abs(days_remaining)} days")
                elif days_remaining == 0:
                    st.warning("⏰ Due today!")
                else:
                    st.info(f"⏱️ {days_remaining} days remaining")
                
                # Task actions
                if task['status'].lower() != 'completed':
                    status_options = {
                        'pending': 'Start Task',
                        'in progress': 'Complete Task'
                    }
                    
                    next_status = status_options.get(task['status'].lower(), 'Update Status')
                    
                    if st.button(next_status, key=f"vol_status_{i}"):
                        new_status_map = {
                            'pending': 'in progress',
                            'in progress': 'completed'
                        }
                        
                        # Update the tasks DataFrame
                        all_tasks, _, _, _, _ = load_data()
                        idx = all_tasks.index[all_tasks['task_id'] == task['task_id']].tolist()[0]
                        all_tasks.at[idx, 'status'] = new_status_map.get(task['status'].lower(), task['status'])
                        all_tasks.to_csv('data/tasks.csv', index=False)
                        
                        st.success(f"Task status updated to {new_status_map.get(task['status'].lower(), task['status']).capitalize()}")
                        st.rerun()

def show_events(events, users, attendance):
    st.title("📅 Events")
    
    is_admin = st.session_state.user_role == 'admin'
    
    # Create new event button for admins
    if is_admin and st.button("Create New Event"):
        st.session_state.creating_event = True
    
    # Create new event form
    if is_admin and 'creating_event' in st.session_state and st.session_state.creating_event:
        st.subheader("Create New Event")
        with st.form("create_event_form"):
            event_title = st.text_input("Event Title")
            event_description = st.text_area("Event Description")
            event_date = st.date_input("Event Date", datetime.date.today() + datetime.timedelta(days=14))
            event_time = st.time_input("Event Time", datetime.time(9, 0))
            event_location = st.text_input("Event Location")
            
            # Coordinator selection (admins or volunteers)
            coordinator_options = users[(users['role'] == 'admin') | (users['role'] == 'volunteer')]
            coordinator_dict = {user['user_id']: f"{user['name']} ({user['role'].capitalize()})" 
                               for _, user in coordinator_options.iterrows()}
            
            selected_coordinator = st.selectbox("Event Coordinator", 
                                               options=list(coordinator_dict.keys()),
                                               format_func=lambda x: coordinator_dict.get(x))
            
            # Initial participants (can be updated later)
            volunteer_options = users[users['role'] == 'volunteer']
            volunteer_dict = {user['user_id']: user['name'] 
                             for _, user in volunteer_options.iterrows()}
            
            selected_participants = st.multiselect("Initial Participants", 
                                                  options=list(volunteer_dict.keys()),
                                                  format_func=lambda x: volunteer_dict.get(x))
            
            submitted = st.form_submit_button("Create Event")
            if submitted:
                if event_title and event_description and event_location:
                    # Create new event
                    new_event = pd.DataFrame({
                        'event_id': [f"evt{str(uuid.uuid4())[:6]}"],
                        'title': [event_title],
                        'description': [event_description],
                        'date': [event_date.strftime('%Y-%m-%d')],
                        'time': [event_time.strftime('%H:%M:%S')],
                        'location': [event_location],
                        'coordinator': [selected_coordinator],
                        'participants': [','.join(selected_participants)],
                        'status': ['upcoming'],
                        'created_by': [st.session_state.user_id],
                        'created_date': [datetime.date.today().strftime('%Y-%m-%d')]
                    })
                    
                    all_events = pd.concat([events, new_event], ignore_index=True)
                    all_events.to_csv('data/events.csv', index=False)
                    
                    # Create attendance records for participants
                    if selected_participants:
                        new_attendance_records = []
                        for participant_id in selected_participants:
                            new_attendance_records.append({
                                'record_id': f"att{str(uuid.uuid4())[:6]}",
                                'event_id': new_event['event_id'][0],
                                'user_id': participant_id,
                                'status': 'confirmed',
                                'check_in': '',
                                'check_out': '',
                                'tasks': ''
                            })
                        
                        if new_attendance_records:
                            new_attendance_df = pd.DataFrame(new_attendance_records)
                            all_attendance = pd.concat([attendance, new_attendance_df], ignore_index=True)
                            all_attendance.to_csv('data/attendance.csv', index=False)
                    
                    st.success("Event created successfully!")
                    st.session_state.creating_event = False
                    st.rerun()
                else:
                    st.warning("Please fill all required fields.")
        
        if st.button("Cancel"):
            st.session_state.creating_event = False
            st.rerun()
    
    # Event filters
    col1, col2 = st.columns(2)
    with col1:
        status_filter = st.selectbox("Filter by Status", ["All", "Upcoming", "Past", "Ongoing"])
    with col2:
        time_period = st.selectbox("Time Period", ["All", "This Week", "This Month", "Next Month"])
    
    # Apply filters to events
    filtered_events = events.copy()
    
    # Status filter
    if status_filter != "All":
        if status_filter == "Past":
            filtered_events = filtered_events[
                pd.to_datetime(filtered_events['date']) < datetime.datetime.now()
            ]
        elif status_filter == "Upcoming":
            filtered_events = filtered_events[
                pd.to_datetime(filtered_events['date']) > datetime.datetime.now()
            ]
        elif status_filter == "Ongoing":
            today = datetime.date.today().strftime('%Y-%m-%d')
            filtered_events = filtered_events[filtered_events['date'] == today]
    
    # Time period filter
    if time_period != "All":
        today = datetime.date.today()
        if time_period == "This Week":
            start_of_week = today - datetime.timedelta(days=today.weekday())
            end_of_week = start_of_week + datetime.timedelta(days=6)
            filtered_events = filtered_events[
                (pd.to_datetime(filtered_events['date']) >= start_of_week) & 
                (pd.to_datetime(filtered_events['date']) <= end_of_week)
            ]
        elif time_period == "This Month":
            start_of_month = datetime.date(today.year, today.month, 1)
            if today.month == 12:
                end_of_month = datetime.date(today.year+1, 1, 1) - datetime.timedelta(days=1)
            else:
                end_of_month = datetime.date(today.year, today.month+1, 1) - datetime.timedelta(days=1)
            
            filtered_events = filtered_events[
                (pd.to_datetime(filtered_events['date']) >= start_of_month) & 
                (pd.to_datetime(filtered_events['date']) <= end_of_month)
            ]
        elif time_period == "Next Month":
            if today.month == 12:
                start_of_next_month = datetime.date(today.year+1, 1, 1)
                end_of_next_month = datetime.date(today.year+1, 2, 1) - datetime.timedelta(days=1)
            else:
                start_of_next_month = datetime.date(today.year, today.month+1, 1)
                if today.month == 11:
                    end_of_next_month = datetime.date(today.year+1, 1, 1) - datetime.timedelta(days=1)
                else:
                    end_of_next_month = datetime.date(today.year, today.month+2, 1) - datetime.timedelta(days=1)
            
            filtered_events = filtered_events[
                (pd.to_datetime(filtered_events['date']) >= start_of_next_month) & 
                (pd.to_datetime(filtered_events['date']) <= end_of_next_month)
            ]
    
    # For volunteers, only show events they're part of or all upcoming events
    if not is_admin:
        # Get events where volunteer is a participant
        my_event_ids = []
        for _, event in events.iterrows():
            participants = str(event['participants']).split(',') if pd.notna(event['participants']) else []
            if st.session_state.user_id in participants or event['coordinator'] == st.session_state.user_id:
                my_event_ids.append(event['event_id'])
        
        # Filter to only show user's events and upcoming events
        user_events = filtered_events[filtered_events['event_id'].isin(my_event_ids)]
        upcoming_events = filtered_events[
            (pd.to_datetime(filtered_events['date']) >= datetime.datetime.now()) & 
            (filtered_events['status'] == 'upcoming')
        ]
        
        filtered_events = pd.concat([user_events, upcoming_events]).drop_duplicates()
    
    # Sort events by date
    filtered_events = filtered_events.sort_values('date')
    
    # Display events
    st.subheader("Events")
    if filtered_events.empty:
        st.write("No events found matching the criteria.")
    else:
        for i, event in filtered_events.iterrows():
            # Format event title with date
            event_date = datetime.datetime.strptime(event['date'], '%Y-%m-%d').date()
            today = datetime.date.today()
            
            if event_date < today:
                status_emoji = "✅"  # Past event
            elif event_date == today:
                status_emoji = "🔵"  # Today's event
            else:
                status_emoji = "📅"  # Upcoming event
            
            title_text = f"{status_emoji} {event['title']} - {event['date']}"
            
            with st.expander(title_text):
                col1, col2 = st.columns(2)
                
                with col1:
                    st.write(f"**Description:** {event['description']}")
                    st.write(f"**Date & Time:** {event['date']} at {event['time']}")
                    st.write(f"**Location:** {event['location']}")
                
                with col2:
                    # Show coordinator
                    coordinator = users[users['user_id'] == event['coordinator']]
                    if not coordinator.empty:
                        st.write(f"**Coordinator:** {coordinator.iloc[0]['name']}")
                    
                    # Show participants count
                    participants = str(event['participants']).split(',') if pd.notna(event['participants']) and event['participants'] else []
                    st.write(f"**Participants:** {len(participants)} volunteers")
                    
                    # Show days until event
                    event_date = datetime.datetime.strptime(event['date'], '%Y-%m-%d').date()
                    days_until = (event_date - today).days
                    
                    if days_until < 0:
                        st.write("**Status:** Completed")
                    elif days_until == 0:
                        st.write("**Status:** Today!")
                    else:
                        st.write(f"**Status:** {days_until} days to go")
                
                # Admin actions
                if is_admin:
                    action_col1, action_col2, action_col3 = st.columns(3)
                    
                    with action_col1:
                        if st.button("Manage Participants", key=f"manage_part_{i}"):
                            st.session_state.managing_participants = i
                            st.session_state.managing_event_id = event['event_id']
                    
                    with action_col2:
                        status_options = {
                            'upcoming': 'Mark as Completed',
                            'completed': 'Mark as Upcoming',
                            'cancelled': 'Mark as Upcoming'
                        }
                        
                        next_status = status_options.get(event['status'].lower(), 'Update Status')
                        
                        if st.button(next_status, key=f"event_status_{i}"):
                            new_status_map = {
                                'upcoming': 'completed',
                                'completed': 'upcoming',
                                'cancelled': 'upcoming'
                            }
                            
                            events.at[i, 'status'] = new_status_map.get(event['status'].lower(), event['status'])
                            events.to_csv('data/events.csv', index=False)
                            st.success(f"Event status updated to {new_status_map.get(event['status'].lower(), event['status']).capitalize()}")