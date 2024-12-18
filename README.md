# Application Programming Interface (API) for querying data from ME system.

The purpose of this API is to avoid developers from directly interacting with the MES database. One of the objetives is that developers not used with the MES database structure avoid brute force a extraction of data, thus minimizing the occurence of dangerous queries that could potentially stop the service (and, in turn, affecting production processes).

The API is split in two "routes" or ways to access MES data, in the form of two seperate files:
- repmes.js
- mesprod.js

Each one handles similar requests but the database accessed is different; for example repmes.js access the REPSALPROD database. 

Currently (04/12/2022) this API can handle request for information about:
- Batches,
- Products,
- Process Plans, and
- Machines.

Methods added on 05/01/2023:
- Buffers

this was done taking into account was is often requested from users (for example, for batches new part type and old part type are always requested in a query); some took into account that the information is not so simple to extract from the database and could be of great use (for example, the attributes of equipments). More request could be added if it seems worthy, but queries that are used for specific applications and seem to be of no use for the general public (i.e. that are only used in one and one application only and other users see them as meaningless) must be done by each developer individually.

## General information about the API

This API currently can only handle GET request. POST, PUT, PATCH or DELETE request should not be, for any circumstance, be used by developers, if a need like this arises, all request will be log to track any and all interactions in case a problem occurs; also, request like should be done by developers with proper clearence.

The requests must have a body that is a JSON object, no other type of data will be accepted. If necessary, url-encoded variables could be accepted if the need arises. There's a logic to check if the JSON sent in the request has the correct form, this was properly explained to Rolando Aguinada acting as developer manager, and he should have inform the developer team.

All responses are a JSON object, this includes error messages. Also, the proper status code is sent. A message is sent at the end of the response telling what type of information is returned

## Methods type. Types of information that can be returned

### Batch

Information from batches can be return from either from MES or REPMES databases. REPMES request are highly encourage for batch information because barely any application needs real-time data. The methods for batch are thus:

- batchinfo (for MES and REPMES routes):
    - this query the information of the status of batches. This method can be used to query data from multiple batches at once and, depending of the route use, the information returned will be different:
            - REPMES: data about the last step and handle where a TrackOut occur, new part type, old part type, status (i.e. active or otherwise), quantity of pieces up to the last TrackOut operation, case size, capacitance, voltage, semifinished new part type.
            - MES: the same information as for the REPMES route but as it appears in the Factory Works Client, so, this is up-to-date information. It also returns the current rule being executed (or waiting to be executed), the time since a batch change the rule applied to it process plan it has assing.

- batchattrib (for REPMES only):
    - this query the information of all attributes a batch has up to the last TrackOut. It returns the attribute, its value, the date when it was assign (or modified), the step and the handle. This method accepts multiple batches but is advised to query for not more than 100 batches as this table used is one of the least optimized to handle large amount of parameter in an IN condition.

- batchstep (for REPMES only):
    - returns information of when a batch was process at a particular step up to the last TrackOut, shift, operator quantity of pieces at each step, equipment, handle, quantity of scrap when it left a step and handling time. This method accepts multiple batches.

- batchdefects (for MES only):
    - returns the amount of units of scrap and good units at each step up to the last TrackOut, how many were processed in that step, how many were tested (if at all), the operator that entered the amounts to the client, shift and of remnant units in the Assembly plant (this is a portion of the good units that were left out to ship "standard reels"; for example if the total of good units after the Complete step are 11600 for a case C/D/E product with a type "R" reel, then 100 units will be left out of the total shipped to the client because the amount of standard reels in this case -a reel with 500 units- that returns a integer for the operation 11600/500 is 230 or 11500 units). This method can accept multiples batches.

- batchtestresults (for REPMES only):
    - returns the values for a tested perfomed on a batch, step, median, mean, standard deviation, operator that performed the test, date and the result of the test (PASS or FAIL). This method can accept multiples batches.


### Products

- processplan (for MES only):
    - returns information about the process plans assing to a product. Only if a product is active and has an active process plan data will be returned. The information returned is the person that created or modified a process plan, current version, old and new part type and the process plan(s) name(s). Information for multiple products can be requested.

- productattrib (for MES only):
    - returns attributes assign to a product. These are irrespective of the batch or step and are the standard, out-of-the-box attributes assing by Engineering; for batch attributes the batchattrib method would be prefered. The informtation returned is current version, person who created or modified the current version, the name of the attribute and its magnitude. Multiples products can be sent to this method.


### Equipment

- eqpattrib (for MES only):
    - returns attributes assign to equipments; also, who created or modified the current version of the equipment, the description, the current batch loaded into it, the current state (e.g. IDLE), current capacity, user that interacted with it and the step it is assign to. Multiple equipments can be query at the same time.


### Miscellaneous

- rejectcode (for MES only):
    - returns the rejects code for a specific step, their description and units. This method only accepts 1 value at a time and only accepts GET requests. The value search is encoded in the url, like so https://10.0.51.253:2000/rejectcode/S_ASO_Weld



# Changes done on 12/06/2022
- Added a "landing page" that serves as instructive for developers about how the API works and what can it do.


# Changes done on 12/08/2022
- Added a misc method to search for the reject codes of a specific path.
- Added the explanation for that method on the landing page.
- Fix minor typos for some explanations


# Changes done on 01/05/2023
- Added a methods to manage buffers. Methods were created to update information about locations on the table FWCATNS_LOCATIONS, this methods are accesible through the "other" route. The methods are:
    - updatelocator: use to change information of locations and to change their status (able, disable, availabel, unavailable). This method needs 4 values for each JSON element: Location to update, batch (usually it will be either "INVALID" or NULL values) and Occupied and Capacity flag (that takes 0 or 1 values). It also needs an element that shows the user that is making the modifications, the image below shows an example, note that the number for the key of each element don't really matter, as they don't necessarily need to be numbers, also, the names for the keys inside each element ARE MANDATORY AND SHOULD NOT BE NAME IN ANY OTHER WAY.

    ![Alt text](img/peticion-PUT-locators.png "Example of how the JSON for the method updatelocator needs to be form")


    - createlocator: create a new entry on the FWCATNS_LOCATOR table. Is used when new locations need to be added to a particular buffer, this method needs the locator name and the buffer to it will be assign; we also need to specify the user that created the new locations.the image below shows an example, note that the number for the key of each element don't really matter, as they don't necessarily need to be numbers, also, the names for the keys inside each element ARE MANDATORY AND SHOULD NOT BE NAME IN ANY OTHER WAY.

        ![Alt text](img/peticion-POST-locators.png "Example of how the JSON for the method createlocator needs to be form")


    - availablelocators: returns the locations available in a particular buffer and the quantity of locations availables. The value search is encoded in the url, like so https://10.0.51.253:2000/availablelocators/RABUFFER


# Changes done on 02/01/2023
- changed the batchinfo to be a standard get method, so the value search could be in the URL, instead of sending a body.


# Changes done on 24/02/2023
- added a new method (getLocationInformation) that search information from the buffers depending in the user input. This not substitues the other buffer related method, because this one is more general in its usage and can manage different kind of petitions. This method have two mandatory parameter: buffer and status; buffer means which of the three buffers should it search in, status mean if it should return all locations that are created or only enable/disable. A third optional parameter is the initial and final locations. If a user wants to search for an specific range of locations, they change how the API response, like so

    ![Alt text](img/peticion-GET-locations-general.PNG "pseudocode explaining how the parameter of initial and final locations affects what the API returns.")


# Changes done on 13/03/2024
There are so many changes since the last commit, so we will group then with the following reason:
    - Changes to improve functionality and stability of the API.

The newest addition is the method batchrecipeinfo. This method searches information about the recipe assigned to a step for a batch, it returns:
    - PROCESSINGSTATUS.
    - STEPNAME.
    - PARAMETER_VALUE_STRING (or the value for that recipe).
This method can process only 1 batch at a time. Is a GET method.

We changed the response of some of the methods:
    - The additional message sent with some of the methods (like getBatchActualPosition) is not longer sent. It was counterproductive (And, honestly, unncecessary). So now, the message is only the information returned by the query.