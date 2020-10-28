<template>
  <div style="height: 100%; width: 100%">
    <l-map
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      style="height: 100%"
    >
      <l-tile-layer :url="url" :attribution="attribution" />

      <div v-for="city in preferredCities" :key="city.geonameid">
        <l-marker
          v-if="city.location"
          :lat-lng="latLng(city.location.lat, city.location.lng)"
        >
          <l-popup>
            <div class="city__tooltip">
              <i
                :class="`el-icon-${isSaving(city) ? 'loading' : 'delete'}`"
                @click="saveCity(city, false)"
              ></i>
              <div class="title">{{ city.name }}</div>
              <div>Country: {{ city.country }}</div>
              <div>Population: {{ city.location.population }}</div>
            </div>
          </l-popup>
        </l-marker>
      </div>
    </l-map>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { latLng } from "leaflet";
import { LMap, LTileLayer, LMarker, LPopup } from "vue2-leaflet";
import { mapGetters, mapActions } from "vuex";
import { CityInfo } from "../../store/modules/cities/types";

export default Vue.extend({
  name: "PreferredLocation",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup
  },
  computed: {
    ...mapGetters("cities", ["preferredCities"])
  },
  data() {
    return {
      saving: {},
      latLng,
      zoom: 2,
      center: latLng(47.41322, -1.219482),
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      mapOptions: {
        zoomSnap: 1
      },
      markers: [
        {
          lat: 47.41322,
          lng: -1.219482,
          name: "name",
          country: "country",
          subcountry: "subcountry",
          population: 12345,
          popupVisibility: false,
          geonameid: 1
        },
        {
          lat: 47.41422,
          lng: -1.250482,
          name: "name",
          country: "country",
          subcountry: "subcountry",
          population: 12345,
          popupVisibility: false,
          geonameid: 2
        }
      ]
    };
  },
  methods: {
    ...mapActions("cities", ["savePreferredCities"]),
    async saveCity(city: CityInfo, selected: boolean) {
      const geonameid = city.geonameid;
      try {
        this.$set(this.saving, geonameid, true);
        city!.location!.popupVisibility = false;
        await this.savePreferredCities([{ city, selected }]);
        this.saving[geonameid] = false;
      } catch (error) {
        this.saving[geonameid] = false;
        this.$message.error({
          type: "error",
          message: `Failed to save ${city.name} (${city.country}). Please try again.`,
          duration: 5000
        });
      }
    },
    isSaving(item): boolean {
      return this.saving[item.geonameid];
    }
  }
});
</script>

<style lang="scss">
.leaflet-container {
  background: #a9d3de;
}
.leaflet-popup-content-wrapper,
.leaflet-popup-tip {
  background-color: $secondary-color;
}
.leaflet-popup-close-button {
  color: transparent !important;
  pointer-events: none;
}
.city__tooltip {
  position: relative;
  .title {
    font-weight: 500;
    font-size: 0.8rem;
  }
  .el-icon-delete,
  .el-icon-loading {
    font-size: 1rem !important;
    color: $main-color;
    position: absolute;
    font-weight: 500;
    right: -10px;
    top: -5px;
  }

  .el-icon-delete {
    font-weight: 800;
  }
}
</style>
