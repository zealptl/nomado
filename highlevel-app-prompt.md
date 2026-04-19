# App Idea
This is a collaborative trip itinerary planner app on desktop with mobile friendly view. 

# Problem  & Solution
Usually, when my friends and I plan a trip we just create a doc and edit the doc with the items we do want to do on the trip. However, I want to create a simple yet elegant app that lets me interactively create an itinerary with my friends. I want to be able create a trip itinerary, invite my friends to it. There we can add new items to the itinerary by day. For each item  we can add a date, day of trip, location, tags such as food, drinks, clubs, stay, activity, etc. People can define their own tags they want to add to an item. Users can also add images to the itinerary so its easier to see what the item is. I want this UI to simple but elegant to use. Usually the issues with trip planners is that they overload the user with information. For my design, keep things hidden until its needed. These can be achieved via toggles. Usually the way we like to organize the trip plan is to have a highlevel plan for the each day of the trip. For example: 

Days 1–3: Barcelona (Fri Aug 21 – Mon Aug 24, 3 nights)
Day 4-8: Valencia (Mon Aug 24 - Fri Aug 28)
Day 4 - Train to Valencia (Mon Aug 24),
Day 5 - full day in Valencia
Day 6: LA TOMATINA (Wed Aug 26) - travel to Bunol (part of your package)
Day 7: Alicante day trip (Thu Aug 27)
Days 8-11: Ibiza (Fri Aug 28 - Mon 31)
Day 8: Fly to Ibiza (Fri Aug 28)
Day 11: Fly to Barcelona (Mon Aug 31)

This high level plan you can show in a panel some where and when you click on each day you can see each items but other wise in other panel all  the panels are organized by day. Then you can have toggles to show different things for the trip. So for a given day you can have toggles for food, drinks, night acitvies, stays, etc. 

# High level user stories

1. User lands on a landing page that shows a cool ui that's inviting for a travel planner app. The landing page has a panel on the right hand side for a log in options.
2. User is able to log into the app via two methods: Sign in with Google or Sign in with Apple. You must look up documentation on how to integrate both Sign In with Google and Sign In with Apple
3. Once the user is logged in they see their they see two sections split screen horizontally in two. one is my trips and it shows all the trips you have created. These trips show an image of the destination, destination title, days of the trip, etc
4. Next section is shared with me. These are the trips that you have been invited to collaborate with.
5. Once you open a trip, you see a high level plan on a panel on left hand side. This highlevel plan is grouped by cities and then days like the plan i shared above. 
6. Once you click on each day it shows you a more detailed view. This shows all the items for the day. For each day there are filters like food, drinks, stay, activity, going out etc. This pills allow you to filter item. 
7. For each item keep things concise do not overwhelm the users with information. This is my biggest gripe with existing travel itineraries.
8. For each day there's a Add Item button that allows users to add an item to the day. When user clicks this they can fill out the title, description, add photos of the location, add a maps link, etc, time etc. 
9. For each day's items are rearrangable items so user should be easily able to click, hold, and drag items to rearrange
10. Collab on a trip with friends. The person who created a trip see an Invite button. When a user clicks on this invite button an invite link is generated and user see an option to copy the invite link. 
11. When another user clicks on the invite link it takes them to the main site, if they are not logged in it forwards to login page. Once the user logs in the trip encoded in the invite link shows up on Shared with me section. 

## backend stories
1. Create a CRUD API for trips 
2. Create a CRUD API for itinerary items
3. Create an API to store images
4. Setup a supabase database to store data for trips, itinerary items, user data, etc
5. setup supabase to store images
6. Create functionality to invite people to a trip. So this will be an invite link This allows users to make edits to an itinerary and collaborate with their friends. There needs to be some API to handle the invitation to a trip itinerary. So this will add the user that's allowed on a shared app. So there needs to be a way to track this information in the database.

# Tech Stack

1. React vite for frontend (**important** use/trigger the /ui-ux-pro-max skill to interview me for the design system of the frontend app)
2. A node/ typescript app for the backend api for enforced typing and interfaces for datamodels
3. Supabase for database 
4. Vercel for deployment of both frontend and backend apps.

# Instructions 

- use the /ospx-explore and /ospx-propose to explore and plan this app in detail
- use the /ui-ux-pro-max skill to explore the design system and aesthetics of the app based on my description