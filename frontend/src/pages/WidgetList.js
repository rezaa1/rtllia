   // frontend/src/pages/WidgetList.js
   import React, { useEffect, useState, useContext } from 'react';
   import axios from 'axios';
   import { Link } from 'react-router-dom';
   import { AuthContext } from '../utils/AuthContext'; // Ensure the path is correct

   const WidgetList = () => {
     const { currentUser } = useContext(AuthContext); // Get the current user from context
     const [widgets, setWidgets] = useState([]);

     useEffect(() => {
       const fetchWidgets = async () => {
         try {
           const orgId = currentUser.organizationId; // Access the organization ID from the user context
           const token = localStorage.getItem('token'); // Retrieve the token
           const response = await axios.get(`/api/widgets/organization/${orgId}`, {
             headers: {
               Authorization: `Bearer ${token}` // Include the token in the headers
             }
           });
           setWidgets(response.data);
         } catch (error) {
           console.error('Error fetching widgets:', error);
         }
       };

       fetchWidgets();
     }, [currentUser]);

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