import hassapi as hass
import json

class RenameDeviceEntities(hass.Hass):
    def initialize(self):
        """Listen for device name changes."""
        self.listen_event(self.device_renamed, "device_registry_updated")

    def device_renamed(self, event_name, data, kwargs):
        # Wait for ten seconds
        self.log("Waiting for 10 seconds before processing device rename event.")
        self.run_in(self.process_device_rename, 10, data=data)

    def process_device_rename(self, kwargs):
        data = kwargs.get("data")
        if not data:
            self.log("No data found in the event.")
            return
        
        device_id = data.get("device_id")
        if not device_id:
            self.log("Missing device_id, skipping.")
            return

        old_name = data.get("changes", {}).get("name_by_user")
        self.log(f"Device renamed event received: {device_id} with old name - {old_name}")
        # Open and read the file located at /config/.storage/core.device_registry, parse it as JSON and find the item in data.devices array that matches the device_id.
        try:
            with open('/config/.storage/core.device_registry', 'r') as file:
                self.log("Opened device registry file")
                data = json.load(file)
            self.log("Searching for device in device registry")
            devices = data.get('data', {}).get('devices')
            if not devices:
                self.log("No devices found in the device registry.")
                return
            if not any(item.get('id') == device_id for item in devices):
                self.log(f"Device ID {device_id} not found in the device registry.")
                return
            device = next((item for item in devices if item.get('id') == device_id), None)
            if not device:
                self.log(f"Device with ID {device_id} not found.")
                return            
            self.log(f"Device found: {device.get('name')}")
            # Check if the device name has changed
            # and if so, rename the entities associated with that device
            new_name = device.get('name_by_user')
            if new_name is None:
                self.log("New device name not found in the device data.")
                return
            if old_name is None:
                old_name = device.get('name')

            self.log(f"Old device name: {old_name}, New device name: {new_name}")
            if old_name != new_name:
                self.log(f"Device name changed from {old_name} to {new_name}")
                self.rename_device_entities(device_id, device.get('name'), new_name, old_name)
        except FileNotFoundError:
            self.log("Device registry file not found.")
        except json.JSONDecodeError:
            self.log("Error decoding JSON from device registry file.")
        except Exception as e:
            self.log(f"An unexpected error occurred: {e}")
       
    def rename_device_entities(self, device_id, device_original_name, new_name, old_name):
        # Open the file located at /config/.storage/core.entity_registry, parse it as JSON and find the item in data.entities array that matches the device_id. For each matching entity, rename it to the new name. Finally, write the updated data back to the file.
        try:
            with open('/config/.storage/core.entity_registry', 'r') as file:
                data = json.load(file)
            entities = data.get('data', {}).get('entities')
            if not entities:
                self.log("No entities found in the entity registry.")
                return
            if not any(item.get('device_id') == device_id for item in entities):
                self.log(f"Device ID {device_id} not found in the entity registry.")
                return
            self.log("Searching for entities associated with the device ID")
            for entity in entities:
                if entity.get('device_id') != device_id:
                    continue
                old_entity_id = entity.get('entity_id')
                self.log(f"Renaming entity {old_entity_id} for device ID {device_id}")
                domain, object_id = old_entity_id.split('.')
                new_object_id = object_id.replace(old_name.lower().replace(' ', '_').replace('-', '_').replace('.', '_'), new_name.lower().replace(' ', '_').replace('-', '_').replace('.', '_'))
                # Remove trailing numbers from the new object ID
                new_object_id = new_object_id.rstrip('_0123456789')
                if (new_object_id == object_id):
                    self.log(f"New object ID is the same as the old one; replacing device original name instead: {new_object_id}, {device_original_name}.")
                    new_objectId = new_object_id.replace(device_original_name.lower().replace(' ', '_').replace('-', '_').replace('.', '_'), new_name.lower().replace(' ', '_').replace('-', '_').replace('.', '_'))
                    
                if (new_object_id == object_id):
                    self.log(f"New object ID is the same as the old one: {new_object_id}. Skipping.")
                    continue
                
                self.log(f"New object ID: {new_object_id}. Old object ID: {object_id}")

                new_entity_id = f"{domain}.{new_object_id}"
                # Ensure the new object ID is unique
                existing_entity = next((e for e in entities if e.get('entity_id') == f"{domain}.{new_object_id}"), None)
                if existing_entity:
                    count = 1
                    self.log(f"Entity ID {existing_entity.get('entity_id')} already exists, appending a number to the new object ID.")
                    while existing_entity:
                        count += 1
                        existing_entity = next((e for e in entities if e.get('entity_id') == f"{domain}.{new_object_id}_{count}"), None)
                    new_entity_id = f"{domain}.{new_object_id}_{count}"

                entity['entity_id'] = new_entity_id
            with open('/config/.storage/core.entity_registry', 'w') as file:
                json.dump(data, file, indent=2)
        except FileNotFoundError:
            self.log("Entity registry file not found.")
        except json.JSONDecodeError:    
            self.log("Error decoding JSON from entity registry file.")
        except Exception as e:
            self.log(f"An unexpected error occurred: {e}")
