   // frontend/src/pages/WidgetList.js
   import React, { useEffect, useState } from 'react';
   import axios from 'axios';
   import { Link } from 'react-router-dom';
   import { useAuth } from '../utils/AuthContext'; // Import the Auth context

   const WidgetList = () => {
     const { currentUser } = useAuth(); // Get the current user from context
     const [widgets, setWidgets] = useState([]);

     useEffect(() => {
       const fetchWidgets = async () => {
         try {
           if (!currentUser) {
             console.error('User not authenticated');
             return;
           }

           const orgId = currentUser.organizationId; // Get organization ID from authenticated user
           const token = currentUser.token; // Get token from authenticated user
           console.log('Organization ID:', orgId); // Debugging log
           console.log('Token:', token); // Debugging log

           const response = await axios.get(`/api/widgets/organization/${orgId}`, {
             headers: {
               Authorization: `Bearer ${token}` // Include the token in the headers
             }
           });
           console.log('API Response:', response.data); // Debugging log
           setWidgets(response.data);
         } catch (error) {
           console.error('Error fetching widgets:', error);
         }
       };

       fetchWidgets();
     }, [currentUser]); // Add currentUser as a dependency

     return (
       <div>
         <h1>Widget Configurations</h1>
         <Link to="/widgets/create" className="btn btn-primary mb-3">Create New Widget</Link>
         <ul>
           {widgets.length > 0 ? (
             widgets.map(widget => (
               <li key={widget.id}>
                 <h2>{widget.name}</h2>
                 <p>Agent ID: {widget.agentId}</p>
                 <p>Theme Color: {widget.themeColor}</p>
                 {/* Add more widget details as needed */}
               </li>
             ))
           ) : (
             <p>No widgets found. Please create a new widget.</p>
           )}
         </ul>
       </div>
     );
   };

   export default WidgetList;