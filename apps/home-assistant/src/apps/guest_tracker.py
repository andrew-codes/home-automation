import appdaemon.plugins.hass.hassapi as hass
import appdaemon.plugins.mqtt.mqttapi as mqtt


class GuestTracker(hass.Hass):

    def initialize(self):
        self.log('Starting Guest Tracker')
        self.listen_event(self.on_message, 'MQTT_MESSAGE', topic=self.args["topic"] + "/add", namespace="mqtt")
        self.listen_event(self.on_message, 'MQTT_MESSAGE', topic=self.args["topic"] + "/update", namespace="mqtt")

    def on_message(self, eventName, data, kwargs):
        self.log(data["topic"]+" "+data["payload"])
        groupName = self.args["group_name"]
        groupEntityId = "group." + groupName
        all_entities = self.get_state()
        g = all_entities[groupEntityId]
        self.log(g)

        # Find registered entity with provided MAC address
        entity_of_mac = self.get_entity_of_mac_until_found_or_max_tries(data["payload"], 10)

        # Only process if there is an entity registered with provided MAC.
        if entity_of_mac is None:
            self.log("Entity not found, aborting")
            return

        entity_id = entity_of_mac['entity_id']
        self.log(entity_of_mac)
        group_members = g['attributes']['entity_id']
        new_group_members = list(filter(lambda id: id != entity_id, group_members)) + [
            entity_id]
        self.log('New group members')
        self.log(new_group_members)
        self.call_service('group/set', object_id=groupName,
                          name=g['attributes']['friendly_name'], entities=new_group_members)
        self.log('Group members updated')

    def get_entity_of_mac(self, mac):
        all_entities = self.get_state()
        for key, value in all_entities.items():
            if value['attributes'] and 'mac' in value['attributes']:
                if str(value['attributes']['mac']) == mac:
                    return value
        return None
    
    def get_entity_of_mac_until_found_or_max_tries(self, mac, max_tries):
        entity = self.get_entity_of_mac(mac)
        tries = 0
        while entity is None and tries < max_tries:
            self.log("Entity not found, waiting 5 second")
            self.sleep(5)
            entity = self.get_entity_of_mac(mac)
            tries += 1
        return entity
