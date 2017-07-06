import {inject, TestBed} from "@angular/core/testing";
import {OverpassService} from "../public_src/services/overpass.service";
import {ConfigService} from "../public_src/services/config.service";
import {LoadingService} from "../public_src/services/loading.service";
import {AuthService} from "../public_src/services/auth.service";
import {EditingService} from "../public_src/services/editing.service";
import {ProcessingService} from "../public_src/services/processing.service";
import {StorageService} from "../public_src/services/storage.service";
import {MapService} from "../public_src/services/map.service";
import {Http} from "@angular/http";


describe("Service: OverpassService", () => {
    // ...variable declarations
    // ``` + ConfigService.appName + ```
    let metadata = ({ "comment": "testComment", "source": "testSource" });
    // let changeset: string = ```<osm>
    //     <osmChange version="0.6">
    //         <tag k="created_by" v="osm-pt-ngx-leaflet 0.0.1"></tag>
    //         <tag k="source" v="testSource"></tag>
    //         <tag k="comment" v="testComment"></tag>
    //     </osmChange>
    // </osm>```;

    // let changeset: string = "<osmChange></osmChange>";
    let s = OverpassService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AuthService, Http, EditingService, MapService,
                StorageService, ProcessingService, LoadingService, OverpassService]
        });
    });

    beforeEach(inject([OverpassService], (overpassService: OverpassService) => {
        let serv = OverpassService;
    }));

    it("should return XML changeset as string", () => {
        expect(2).toEqual(2);
        // expect(this.serv.createChangeset(metadata).toEqual(changeset));
        // expect(service.getForm(2)).toEqual(testForms[0]);
    });

    // describe("#createChangeset", () => {
    //     // beforeEach(() => {
    //     //     service.setForms(testForms);
    //     // });
    //
    //
    // });

});

