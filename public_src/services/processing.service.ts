import { EventEmitter, Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";

import { LoadingService } from "./loading.service";
import { MapService } from "./map.service";
import { StorageService } from "./storage.service";

import { IOsmEntity } from "../core/osmEntity.interface";
import { IPtRelation } from "../core/ptRelation.interface";
import { IPtStop } from "../core/ptStop.interface";

@Injectable()
export class ProcessingService {
    // Observable boolean sources
    private showRelationsForStopSource = new Subject<boolean>();
    private showStopsForRouteSource = new Subject<boolean>();
    private refreshSidebarViewsSource = new Subject<string>();
    // Observable boolean streams
    public showRelationsForStop$ = this.showRelationsForStopSource.asObservable();
    public showStopsForRoute$ = this.showStopsForRouteSource.asObservable();
    public refreshSidebarViews$ = this.refreshSidebarViewsSource.asObservable();
    public membersToDownload: EventEmitter<object> = new EventEmitter();
    public refreshMasters: EventEmitter<object> = new EventEmitter();

    constructor(private storageService: StorageService,
                private mapService: MapService,
                private loadingService: LoadingService) {

        // this.mapService.popupBtnClick.subscribe(
        //     (data) => {
        //         let featureType = data[0];
        //         let featureId = Number(data[1]);
        //         let element = this.findElementById(featureId, featureType);
        //         if (!element) {
        //             alert("Element was not found?!");
        //         } else if (featureType === "node") {
        //             this.exploreStop(element);
        //         } else if (featureType === "relation") {
        //             this.exploreRelation(element);
        //         }
        //     }
        // );

        this.mapService.markerClick.subscribe(
            /**
             * @param data - string containing ID of clicked marker
             */
            (data) => {
                const featureId = Number(data);
                const element = this.getElementById(featureId);
                if (!element) {
                    alert("Clicked element was not found?!");
                }
                console.log("LOG (processing s.) Selected element is ", element);
                this.refreshTagView(element);
            }
        );
    }

    /**
     * Returns elemenet with specific ID directly from mapped object.
     * @param featureId
     */
    public getElementById(featureId: number): any {
        if (this.storageService.elementsMap.has(featureId)) {
            return this.storageService.elementsMap.get(featureId);
        }
    }

    /**
     * Filters data in the sidebar depending on current view's bounding box.
     */
    public filterDataInBounds(): void {
        if (!this.storageService.localJsonStorage || this.storageService.listOfStops.length > 1000) {
            return console.log("LOG (processing s.) filtering of stops in map bounds was stopped (too much data - limit 1000 nodes).");
        }
        this.mapService.bounds = this.mapService.map.getBounds();
        for (const stop of this.storageService.listOfStops) {
            const el = document.getElementById(stop.id.toString());
            if (!el) {
                return;
            }
            if (el && this.mapService.bounds.contains([stop.lat, stop.lon])) {
                el.style.display = "table-row";
            } else {
                el.style.display = "none";
            }
        }
    }

    /**
     * Generates new unique ID used to store API responses.
     */
    private getResponseId(): number {
        let id = 1;
        while (this.storageService.localJsonStorage.has(id)) {
            id++;
        }
        return id;
    }

    /**
     *
     * @param response
     */
    public processResponse(response: object): void {
        const responseId = this.getResponseId();
        const transformedGeojson = this.mapService.osmtogeojson(response);
        this.storageService.localJsonStorage.set(responseId, response);
        this.storageService.localGeojsonStorage.set(responseId, transformedGeojson);
        this.createLists(responseId);
        this.mapService.renderTransformedGeojsonData(transformedGeojson);
        this.loadingService.hide();
    }

    /**
     *
     * @param response
     */
    public processNodeResponse(response: any): void {
        for (const element of response.elements) {
            if (!this.storageService.elementsMap.has(element.id)) {
                this.storageService.elementsMap.set(element.id, element);
                if (!element.tags) {
                    continue;
                }
                switch (element.type) {
                    case "node":
                        // only nodes are fully downloaded
                        this.storageService.elementsDownloaded.add(element.id);

                        if (element.tags.bus === "yes" || element.tags.public_transport) {
                            this.storageService.listOfStops.push(element);
                        }
                        break;
                    case "relation":
                        if (element.tags.public_transport === "stop_area") {
                            this.storageService.listOfAreas.push(element);
                        } else {
                            this.storageService.listOfRelations.push(element);
                            break;
                        }
                }
            }
        }
        this.storageService.logStats();
    }

    /**
     *
     * @param response
     */
    public processMastersResponse(response: object): void {
        response["elements"].forEach( (element) => {
            if (!this.storageService.elementsMap.has(element.id)) {
                console.log("LOG (processing s.) New element added:", element);
                this.storageService.elementsMap.set(element.id, element);
                this.storageService.elementsDownloaded.add(element.id);
                if (element.tags.route_master) {
                    this.storageService.listOfMasters.push(element);
                } else {
                    console.log("LOG (processing s.) WARNING: new elements? " , element);
                }// do not add other relations because they should be already added
            }
        });
        console.log("LOG (processing s.) Total # of master rel. (route_master)",
            this.storageService.listOfMasters.length);
        this.storageService.logStats();

        const idsHaveMaster: number[] = [];
        this.storageService.listOfMasters.forEach( (master) => {
            for (const member of master["members"]) {
                idsHaveMaster.push(member["ref"]);
            }
        });
        this.refreshMasters.emit({ "idsHaveMaster": idsHaveMaster });
        console.log("LOG (processing s.) Master IDs are:", idsHaveMaster);
    }

    /**
     * Creates initial list of stops/relations.
     * @param id
     */
    public createLists(id: number): void {
        const response = this.storageService.localJsonStorage.get(id);
        response.elements.forEach( (element) => {
            if (!this.storageService.elementsMap.has(element.id)) {
                this.storageService.elementsMap.set(element.id, element);

                switch (element.type) {
                    case "node":
                        // this.storageService.elementsDownloaded.add(element.id);
                        if (element.tags && element.tags.public_transport) {
                            this.storageService.listOfStops.push(element);
                        }
                        break;
                    case "relation":
                        if (element.tags.public_transport === "stop_area") {
                            this.storageService.listOfAreas.push(element);
                        } else if (element.tags.public_transport) {
                            this.storageService.listOfRelations.push(element);
                            break;
                        }
                }
            }
        });
        this.storageService.logStats();
    }

    /**
     * Highlights downloaded stop areas by rectangles.
     */
    public drawStopAreas(): void {
        const boundaries = [];
        for (const area of this.storageService.listOfAreas) {
            const coords = [];
            for (const member of area["members"]) {
                if (member["type"] !== "node") {
                    continue;
                }
                const ref: IPtStop = this.getElementById(member.ref);
                coords.push([ref.lat, ref.lon]);
            }
            const polyline = L.polyline(coords);
            L.rectangle(polyline.getBounds(), { color: "#000000", fill: false, weight: 2 })
                .bindTooltip(area["tags"].name).addTo(this.mapService.map);
        }
    }

    /**
     *
     * @param data
     */
    public activateFilteredRouteView(data: boolean): void {
        this.showRelationsForStopSource.next(data);
    }

    /**
     *
     * @param data
     */
    public activateFilteredStopView(data: boolean): void  {
        this.showStopsForRouteSource.next(data);
    }

    /**
     *
     * @param data
     */
    public refreshSidebarView(data: string): void  {
        this.refreshSidebarViewsSource.next(data);
    }

    /**
     *
     * @param element
     */
    public refreshTagView(element: IOsmEntity): void  {
        if (element) {
            this.storageService.currentElementsChange.emit(JSON.parse(JSON.stringify(element)));
            this.refreshSidebarView("tag");
        } else {
            this.refreshSidebarView("delete tag");
        }
    }

    /**
     * Reinitiates a list of route's variants and refreshes relation browser window.
     * @param rel
     */
    public refreshRelationView(rel: IPtRelation): void {
        this.storageService.listOfVariants.length = 0;
        for (const member of rel.members) {
            const routeVariant = this.getElementById(member.ref);
            this.storageService.listOfVariants.push(routeVariant);
        }
        this.refreshSidebarView("relation");
    }

    /**
     * Explores relation by downloading its members and highlighting stops position with a line.
     * @param rel
     * @param refreshTagView?
     * @param refreshMasterView?
     * @param zoomToElement?
     */
    public exploreRelation(rel: any, refreshTagView?: boolean, refreshMasterView?: boolean, zoomToElement?: boolean): void  {
        this.mapService.clearCircleHighlight();
        const missingElements = [];
        const allowedRefs = ["stop", "stop_exit_only", "stop_entry_only",
            "platform", "platform_exit_only", "platform_entry_only"];
        // skip for new (created) relations
        if (rel.id > 0) {
            rel["members"].forEach( (member) => {
               if (!this.storageService.elementsMap.has(member.ref) &&
                   ["node"].indexOf(member.type) > -1 && allowedRefs.indexOf(member.role) > -1 ) {
                   missingElements.push(member.ref);
               }
            });
        }
        // check if relation and all its members are downloaded -> get missing
        if (!this.storageService.elementsDownloaded.has(rel.id)
            && rel["members"].length > 0 && missingElements.length > 0) {
            console.log("LOG (processing s.) Relation is not completely downloaded. Missing: " + missingElements.join(", "));
            this.membersToDownload.emit({ "rel": rel, "missingElements": missingElements });
        } else if (this.storageService.elementsDownloaded.has(rel.id) || (missingElements.length === 0 && rel.id > 0) ||
            (rel.id < 0 && rel["members"].length > 0)) {
            console.log("podminka plati", rel.id, rel["members"].length);
            this.downloadedMissingMembers(rel, true, zoomToElement);
        } else if (rel.id < 0) {
            this.refreshTagView(rel);
        } else {
            return alert("FIXME: Some other problem with relation - downloaded " + this.storageService.elementsDownloaded.has(rel.id) +
                " , # of missing elements " + missingElements.length + " , # of members " + rel["members"].length + JSON.stringify(rel));
        }
        if (refreshMasterView) {
            // delete rel.members; // FIXME ??? - TOO MANY RELATIONS?
            this.refreshRelationView(rel);
        }
        if (refreshTagView) {
            this.refreshTagView(rel);
        }
    }

    /**
     * Runs rest of the route's higlighting process after the missing members are downloaded.
     * @param rel
     * @param zoomToElement
     * @param refreshTagView
     */
    public downloadedMissingMembers(rel: any, zoomToElement: boolean, refreshTagView: boolean): void {
        if (this.mapService.highlightIsActive()) {
            this.mapService.clearHighlight();
        }
        this.storageService.clearRouteData();
        if (this.mapService.showRoute(rel)) {
            this.mapService.drawTooltipFromTo(rel);
            this.filterStopsByRelation(rel);
            if (zoomToElement) {
                console.log("LOG (processing s.) fitBounds", this.mapService.highlightStroke.length);
                this.mapService.map.fitBounds(this.mapService.highlightStroke.getBounds());
            }
        }
        if (refreshTagView) {
            this.refreshTagView(rel);
        }
    }

    /**
     *
     * @param rel
     */
    public exploreMaster(rel: any): void {
        // if (this.mapService.highlightIsActive()) this.mapService.clearHighlight();
        // let routeVariants: object[] = [];
        // for (let member of rel.members) {
        //     routeVariants.push(this.findElementById(member.ref));
        // }
        console.log("LOG (processing s.) First master's variant was found: ",
            this.storageService.elementsMap.has(rel.members[0].ref));
        if (!this.storageService.elementsMap.has(rel.members[0].ref)) {
            return alert("FIXME: first master's variant is not fully downloaded.");
        }
        // explore first variant and focus tag/rel. browsers on selected master rel.
        this.exploreRelation(this.getElementById(rel.members[0].ref), false, false, false);
        // this.mapService.showRelatedRoutes(routeVariants);
        this.refreshTagView(rel);
        this.refreshRelationView(rel);
    }

    /**
     *
     * @param stop
     */
    public exploreStop(stop: any): void {
        if (this.mapService.highlightIsActive()) {
            this.mapService.clearHighlight();
        }
        this.mapService.showStop(stop);
        const filteredRelationsForStop = this.filterRelationsByStop(stop);
        this.mapService.showRelatedRoutes(filteredRelationsForStop);
        this.refreshTagView(stop);
        this.mapService.map.panTo([stop.lat, stop.lon]);
    }

    /**
     * Filters relations (routes) for given stop.
     * @param stop
     */
    public filterRelationsByStop(stop: IPtStop): object[] {
        this.storageService.listOfRelationsForStop = [];

        for (const relation of this.storageService.listOfRelations) {
            for (const member of relation["members"]) {
                if (member["ref"] === stop.id) {
                    this.storageService.listOfRelationsForStop.push(relation);
                }
            }
        }
        this.activateFilteredRouteView(true);
        this.refreshSidebarView("route");
        return this.storageService.listOfRelationsForStop;
    }

    /**
     * Filters stops for given relation (route).
     * @param rel
     */
    public filterStopsByRelation(rel: IPtRelation): void {
        if (rel === undefined) {
            return alert("FIXME: relation is undefined");
        }
        this.storageService.listOfStopsForRoute.length = 0;
        rel.members.forEach((mem) => {
            if (this.storageService.elementsMap.has(mem.ref)) {
                const stop = this.getElementById(mem.ref);
                const stopWithMemberAttr = Object.assign(JSON.parse(JSON.stringify(mem)), JSON.parse(JSON.stringify(stop)));
                this.storageService.listOfStopsForRoute.push(JSON.parse(JSON.stringify(stopWithMemberAttr)));
            }
        });
        this.activateFilteredStopView(true);
        this.refreshSidebarView("stop");
    }

    /**
     * Zooms to the input element (point position or relation geometry).
     * @param element
     */
    public zoomToElement(element: IOsmEntity): void {
        if (element.type === "node" ) {
            if (!element["lat"] || !element["lon"]) {
                return alert("Warning: Element has no coordinates." + JSON.stringify(element));
            } else {
                this.mapService.map.panTo([element["lat"], element["lon"]]);
            }
        } else {
            const coords = [];
            for (const member of element["members"]) {
                if (member.type === "node") {
                    const elem = this.getElementById(member.ref);
                    if (elem["lat"] && elem["lon"]) {
                        coords.push([elem["lat"], elem["lon"]]);
                    }
                }
            }
            if (coords.length < 2) {
                return alert("FIXME: Not enough coordinates to fitBounds");
            }
            const polyline = L.polyline(coords);
            this.mapService.map.fitBounds(polyline.getBounds());
            console.log("LOG (processing s.) FitBounds to relation geometry");
        }
    }
}
