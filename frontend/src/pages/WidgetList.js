   // frontend/src/pages/WidgetList.js
   import React, { useEffect, useState } from 'react';
   import axios from 'axios';

   const WidgetList = () => {
     const [widgets, setWidgets] = useState([]);

     useEffect(() => {
       const fetchWidgets = async () => {
         try {
           const response = await axios.get('/api/widgets/organization/YOUR_ORG_ID'); // Replace with actual org ID
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
         <ul>
           {widgets.map(widget => (
             <li key={widget.id}>
               <h2>{widget.name}</h2>
               <p>Agent ID: {widget.agentId}</p>
               <p>Theme Color: {widget.themeColor}</p>
               {/* Add more widget details as needed */}
             </li>
           ))}
         </ul>
       </div>
     );
   };

   export default WidgetList;