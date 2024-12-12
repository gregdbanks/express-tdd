# Missions Management Backend API Specifications

Create the backend for a missions directory and incident reporting application. The functionality outlined below is validated by the automated tests. Users have distinct roles that determine what actions they can take. The API should provide secure, sanitized, and role-based access to missions, their related incidents, and incident reports, including file upload capabilities for reports.

## Missions

- **Create a Mission**  
  - `POST /api/missions`  
  - Authenticated users only  
  - Must have appropriate role (e.g., `pilot` or `commander`) to create a mission  
  - Mission data validation must be performed  
  - A unique slug should be generated for each mission

- **List All Missions**  
  - `GET /api/missions`  
  - Supports filtering, selecting specific fields, sorting, and pagination  
  - Supports advanced queries (e.g. filtering by status, using query operators)  
  - Optionally populate related incidents data

- **Get Single Mission**  
  - `GET /api/missions/:id`  
  - Returns the mission by its ID  
  - Optionally populate related incidents data

- **Update Mission**  
  - `PUT /api/missions/:id`  
  - Authenticated users only  
  - Only the mission owner (or a role with sufficient privileges, e.g., `pilot` who created it, or `commander`) can update a mission  
  - Data validation on update

- **Delete Mission**  
  - `DELETE /api/missions/:id`  
  - Authenticated users only  
  - Only the owner or a `commander` role user can delete a mission  
  - Should also cascade delete related incidents and reports associated with the mission

## Incidents

- **Create an Incident for a Mission**  
  - `POST /api/missions/:missionId/incidents`  
  - Authenticated users only  
  - Must have permission to create incidents for that mission (e.g., mission owner or `commander`)  
  - Data validation on creation

- **List All Incidents for a Mission**  
  - `GET /api/missions/:missionId/incidents`  
  - Returns all incidents related to the specified mission

- **Get Single Incident**  
  - `GET /api/incidents/:id`  
  - Returns the incident by its ID

- **Update Incident**  
  - `PUT /api/incidents/:id`  
  - Authenticated users only  
  - Must have permission (e.g., owner of the mission or a `commander`) to update the incident  
  - Data validation on update

- **Delete Incident**  
  - `DELETE /api/incidents/:id`  
  - Authenticated users only  
  - Must have permission to delete the incident (e.g., owner of the mission or `commander`)  
  - Should return 404 if the incident no longer exists after deletion

## Reports

- **Create a Report for an Incident**  
  - `POST /api/missions/:missionId/incidents/:incidentId/reports`  
  - Authenticated users only  
  - Must have permission to create a report on that incident (e.g., mission owner, `commander`, possibly `pilot` if allowed)  
  - Data validation on creation

- **List All Reports for an Incident**  
  - `GET /api/missions/:missionId/incidents/:incidentId/reports`  
  - Returns all reports related to the specified incident

- **Get Single Report**  
  - `GET /api/missions/:missionId/incidents/:incidentId/reports/:reportId`  
  - Returns a single report by its ID within the specified incident

- **Update Report**  
  - `PUT /api/missions/:missionId/incidents/:incidentId/reports/:reportId`  
  - Authenticated users only  
  - Must have permission to update the report  
  - Validation on update

- **Delete Report**  
  - `DELETE /api/missions/:missionId/incidents/:incidentId/reports/:reportId`  
  - Authenticated users only  
  - Must have permission to delete the report  
  - Returns 404 if report not found or already deleted

- **Upload Files to a Report**  
  - `POST /api/missions/:missionId/incidents/:incidentId/reports/:reportId/upload`  
  - Authenticated users only  
  - Must have permission to modify the report  
  - Supports uploading image and video files  
  - Files should be stored and tracked so they can be retrieved later

- **Retrieve Files for a Report**  
  - `GET /api/missions/:missionId/incidents/:incidentId/reports/:reportId/files`  
  - Returns a list of files associated with the report

- **Retrieve a Specific File from a Report**  
  - `GET /api/missions/:missionId/incidents/:incidentId/reports/:reportId/files/:fileId`  
  - Returns a single file if it exists, or 404 if not found

- **Delete a File from a Report**  
  - `DELETE /api/missions/:missionId/incidents/:incidentId/reports/:reportId/files/:fileId`  
  - Authenticated users only  
  - Must have permission to delete files  
  - Returns 404 if the file is not found

## User & Authentication

- **Registration**  
  - `POST /api/v1/auth/register`  
  - Users can register with roles like `user` or `pilot` (as determined by business logic)  
  - Passwords must be hashed  
  - Return a JWT token in a cookie upon successful registration

- **Login**  
  - `POST /api/v1/auth/login`  
  - Users can log in with email and password  
  - Return a valid JWT token in a cookie if credentials are correct  
  - Return 401 if credentials are incorrect

- **Logout**  
  - `POST /api/v1/auth/logout`  
  - Clears the JWT cookie, ending the session

- **Get Current User**  
  - `GET /api/v1/auth/me`  
  - Returns the currently authenticated user’s details  
  - Requires a valid JWT

- **Update User Details**  
  - `PUT /api/v1/auth/updatedetails`  
  - Authenticated users can update their own details  
  - Return validation errors if data is invalid

- **Update Password**  
  - `PUT /api/v1/auth/updatepassword`  
  - Authenticated users can update their password if the current password is correct  
  - Return validation errors for missing or invalid new passwords

- **Forgot Password & Reset Password**  
  - `POST /api/v1/auth/forgotpassword` sends an email with a reset token if user exists  
  - `PUT /api/v1/auth/resetpassword/:resettoken` resets the password using a valid token  
  - Return appropriate errors for invalid tokens, expired tokens, or missing password fields

## Role-Based Access Control (RBAC)

- Certain routes and operations require specific roles:
  - **Commander**: Highest privileges, can manage users and missions  
  - **Pilot**: Can create and manage their own missions and related resources (incidents, reports)  
  - **User**: Limited to less privileged actions; cannot create missions or incidents if not permitted
  - Attempted actions without sufficient privileges return `403 Forbidden`

## User Management (Commander Only)

- **Get All Users**  
  - `GET /api`  
  - Commander can view all users  
  - Lower roles are forbidden

- **Create a User**  
  - `POST /api`  
  - Commander can create new users  
  - Validate user data  
  - Lower roles are forbidden

- **Get Single User by ID**  
  - `GET /api/:id`  
  - Commander can view details of a specific user  
  - Return 404 if user not found  
  - Lower roles are forbidden

- **Update User by ID**  
  - `PUT /api/:id`  
  - Commander can update user details  
  - Return 404 if user not found  
  - Lower roles are forbidden

- **Delete User by ID**  
  - `DELETE /api/:id`  
  - Commander can delete users  
  - Return 404 if user not found  
  - Lower roles are forbidden

## Security & Sanitization

- **Data Sanitization**:  
  - Prevent NoSQL injection attacks  
  - Sanitize data to avoid XSS attacks  
  - Prevent HTTP parameter pollution

- **Security Headers**:  
  - Use Helmet middleware to set secure HTTP headers

- **CORS**:  
  - Enable Cross-Origin Resource Sharing so the API is publicly accessible

- **JWT/Cookie Authentication**:  
  - JWT expires in a set time (e.g., 30 days)  
  - Set cookies with HTTPOnly and secure flags where appropriate

## Error Handling

- **Error Handling Middleware**:  
  - Gracefully handle common database errors (CastError, Duplicate Key Error, ValidationError)  
  - Use async/await error handlers for cleaner controller methods

## Documentation & Deployment

- **Documentation**:  
  - Use Postman for documentation  
  - Use doc generation tools to create HTML documentation served at the root (`/`) of the API

- **Deployment Considerations**:  
  - Deploy to a server (e.g., DigitalOcean Droplet)  
  - Use PM2 for process management  
  - Use Nginx as a reverse proxy  
  - Set up SSL with Let’s Encrypt

- **Code Quality & Config**:  
  - Use environment variables and a config file for constants  
  - NPM scripts for dev and prod environments  
  - Create a database seeder for importing/destroying test data

---

These requirements now accurately reflect the capabilities, roles, and endpoints of the new missions-based backend as verified by the test suite results.