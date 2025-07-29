## Project title: Examination Paper Management System

### Student name: Shanuth Chimbli (sc969)

### Student email: sc969@student.le.ac.uk 

### Project description:

The Examination Paper Management System is a secure and structured web application designed to digitize and manage the internal moderation process of university exam papers. The system is intended for use within academic departments, enabling exam setters, checkers, and external examiners to review, track, and finalize question papers in an organized workflow.

Each examination paper progresses through multiple stages from initial setting to internal checking, external review, and final submission to the Examinations Office. The platform will provide role-based access so that only relevant stakeholders can upload papers, provide feedback, revise content, and approve versions. The goal is to reduce manual communication via emails, increase transparency, and maintain strong document security.

While the system is built to support cloud deployment in the future, I will be developing and testing everything locally for now. All the main features like login, paper uploads, feedback, and progress tracking will be working in a local setup. Optionally, i am also planning to add some smart features like showing changes between document versions and summarizing feedback using simple AI/NLP methods to make the experience smoother and more helpful for users.


### List of requirements (objectives): 

Essential:
- Secure login system with role-based access (setter, checker, examiner, admin)
- Upload and storage of exam papers with version history
- Feedback system for each review phase
- Status transitions: draft → checked → revised → externally approved → final
- Access control to restrict documents to relevant users only

Desirable:
- Dashboard for users to view papers and statuses
- In-app or email notifications for pending actions
- Admin interface for user and paper management
- Activity logs and timestamps for paper events


Optional:
- Version change viewer to highlight edits between submissions
- Feedback summarizer using NLP (e.g. compromise or natural)
- PDF report generator for each paper’s full review cycle
- Smart keyword-based tagging for organizing papers

