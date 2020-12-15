import appdaemon.plugins.hass.hassapi as hass
import appdaemon.plugins.mqtt.mqttapi as mqtt


class GuestTracker(hass.Hass):

    def initialize(self):
        self.log('Starting Guest Tracker')
        self.listen_event(self.on_message, 'MQTT_MESSAGE', topic=self.args["topic"], namespace="mqtt")

    def on_message(self, eventName, data, kwargs):
        self.log(data["topic"]+" "+data["payload"])
        groupName = self.args["group_name"]
        groupEntityId = "group." + groupName
        all_entities = self.get_state()
        g = all_entities[groupEntityId]
        self.log(g)

        # Find registered entity with provided MAC address
        entity_of_mac = None
        for key, value in all_entities.items():
            if value['attributes'] and 'mac' in value['attributes']:
                if str(value['attributes']['mac']) == data["payload"]:
                    entity_of_mac = value

        # Only process if there is an entity registered with provided MAC.
        if entity_of_mac is None:
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
