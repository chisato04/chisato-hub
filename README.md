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
