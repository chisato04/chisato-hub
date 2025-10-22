
# Chisato Hub Project Roadmap

This outlines the planned features and development direction for Chisato Hub. The primary goal is to evolve the hub from a public-facing page into a private, secure portal for our server community.

## Authentication & Core Features

This is focused on implementing the necessary backend and frontend systems to support user accounts and create a secure, private environment.

-   [ ] **Implement User Authentication**
    -   [ ] Create a secure login and registration system.
    -   [ ] Implement session management (e.g., using JWTs or cookies).
    -   [ ] Develop backend endpoints for `/login`, `/register`, `/logout`.
    -   [ ] Create protected routes in the frontend that require a user to be logged in.

-   [ ] **Implement Role-Based Access Control (RBAC)**
    -   [ ] Add a `role` field to the user model in the database (e.g., `admin`, `member`).
    -   [ ] Create middleware on the backend to check user roles for protected API endpoints.
    -   [ ] Conditionally render UI elements based on the logged-in user's role.

-   [ ] **Create a Basic Admin Dashboard**
    -   [ ] Build a new, admin-only page.
    -   [ ] Add functionality to view and manage users (e.g., assign roles, remove users).
    -   [ ] This will serve as the foundation for future admin-only tools.

-   [ ] **Develop an Announcements/News System**
    -   [ ] Create a new database table for posts (`title`, `content`, `author`, `timestamp`).
    -   [ ] Develop a CRUD API for managing announcements (admins only).
    -   [ ] Display announcements on the main portal page for all logged-in users.

## User Experience & Community Engagement

With the core authentication system in place, this focuses on adding features that provide direct value and engagement for players.

-   [ ] **Develop a Personalized Player Dashboard**
    -   [ ] Create a `/dashboard` route for logged-in users.
    -   [ ] Display the user's Minecraft skin and UUID.
    -   [ ] Pull and show player-specific stats (playtime, join date, etc.) from existing server data.
    -   [ ] Show the user's whitelist status.

-   [ ] **Integrate a Private Web Map**
    -   [ ] Set up a server map plugin (e.g., Dynmap, BlueMap).
    -   [ ] Embed the map on a new page within the hub.
    -   [ ] Ensure this page is only accessible to logged-in members to maintain privacy.

-   [ ] **Enhance the Player Gallery**
    -   [ ] Link gallery entries to user profiles.
    -   [ ] Potentially allow users to customize their own gallery "card" with a short bio or social link.

## Advanced Administration & Server Interaction

This aims to empower admins by providing tools to manage the Minecraft server directly from the web interface.

-   [ ] **Implement Server Management Tools for Admins**
    -   [ ] Build a UI for adding/removing players from the `whitelist.json` file.
    -   [ ] Create functionality to start, stop, or restart the Minecraft server via API calls.
    -   [ ] Implement a server backup trigger button.

-   [ ] **Develop a Web-Based Server Console**
    -   [ ] Establish a secure connection to the server's console (e.g., using RCON).
    -   [ ] Create a read-only view of the live server console.
    -   [ ] (Stretch Goal) Add an input field for admins to send commands directly to the server.

-   [ ] **Automate Modpack Updates**
    -   [ ] Create a simple interface for admins to upload new `.mrpack` files.
    -   [ ] Automatically update the mod list and download links on the "Modpack Depot" page.

## Future Goals

Ideas for the future after the core roadmap is complete.

-   [ ] **Discord Integration**
    -   [ ] Allow users to link their Discord accounts.
    -   [ ] Automatically assign a "Server Member" role on Discord after hub registration/approval.
    -   [ ] Post server status updates or announcements to a specific Discord channel.

-   [ ] **Community Polls & Voting System**
    -   [ ] Allow users to vote on new mods, server events, or community decisions.

-   [ ] **Expanded Server Statistics**
    -   [ ] Create detailed graphs and charts for server resource usage over time.
    -   [ ] Develop leaderboards for various player stats.

***

### `docker-compose.yml`

```yaml
services:
  backend:
    image: chisato04/chisato-hub-backend:latest
    container_name: chisato_hub_backend
    restart: unless-stopped
    environment:
      - MINECRAFT_SERVER_PATH=/minecraft
    volumes:
      - ${MINECRAFT_SERVER_PATH}:/minecraft:ro
    networks:
      - chisato_hub_network

  web:
    image: chisato04/chisato-hub-frontend:latest
    container_name: chisato_hub_frontend
    restart: unless-stopped
    ports:
      - "8083:80"
    depends_on:
      - backend
    networks:
      - chisato_hub_network

networks:
  chisato_hub_network:
```

### `.env example`


```bash
# ===============================================
#     Chisato Hub Server Configuration
# ===============================================

# --- REQUIRED ---
# Enter the ABSOLUTE path to your Minecraft server directory on your host machine.
# This allows the application to read player data and statistics.
#
# Example for Linux/macOS: MINECRAFT_SERVER_PATH=/home/user/minecraft
# Example for Windows:     MINECRAFT_SERVER_PATH=C:/Users/User/minecraft
MINECRAFT_SERVER_PATH=
```
