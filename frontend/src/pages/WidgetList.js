   // frontend/src/pages/WidgetList.js
   import React, { useEffect, useState } from 'react';
   import axios from 'axios';
   import { Link } from 'react-router-dom';

   const WidgetList = () => {
     const [widgets, setWidgets] = useState([]);

     useEffect(() => {
       const fetchWidgets = async () => {
         try {
           const orgId = localStorage.getItem('orgId'); // Retrieve the organization ID from local storage
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
     }, []);

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