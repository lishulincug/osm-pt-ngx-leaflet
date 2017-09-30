import { Component, ViewChild } from "@angular/core";

import { AuthService } from "../../services/auth.service";
import { MapService } from "../../services/map.service";
import { OverpassService } from "../../services/overpass.service";
import { StorageService } from "../../services/storage.service";

import { ModalDirective } from "ngx-bootstrap";

@Component({
    providers: [],
    selector: "transporter",
    styles: [
        require<any>("../toolbar/toolbar.component.less"),
        require<any>("./transporter.component.less"),
    ],
    template: require<any>("./transporter.component.html")
})
export class TransporterComponent {
    @ViewChild("downloadModal") public downloadModal: ModalDirective;
    @ViewChild("uploadModal") public uploadModal: ModalDirective;
    private favoriteQueries = [
        {
            id: 1,
            raw: "%5Bout%3Ajson%5D%5Btimeout%3A25%5D%3B%0A(%0A%20%20node%5B%22route%22%3D%22bus%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20way%5B%22route%22%3D%22bus%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20relation%5B%22route%22%3D%22bus%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3B%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B",
            short: "route=bus"
        },
        {
            id: 2,
            raw: "%5Bout%3Ajson%5D%5Btimeout%3A25%5D%3B%0A(%0A%20%20node%5B%22route%22%3D%22bus%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20way%5B%22route%22%3D%22bus%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20relation%5B%22route%22%3D%22bus%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20node%5B%22highway%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20way%5B%22highway%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20relation%5B%22highway%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3B%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B",
            short: "route=bus OR highway=*"
        },
        {
            id: 3,
            raw: "%5Bout%3Ajson%5D%5Btimeout%3A25%5D%3B%0A%28%0A%20%20node%5B%22public_transport%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%20%20way%5B%22public_transport%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%20%20relation%5B%22public_transport%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%29%3B%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B",
            short: "public_transport=*"
        }
    ];
    private queryShort = this.favoriteQueries[0].short;
    private queryRaw = decodeURIComponent(this.favoriteQueries[0].raw);
    private editsSummary;

    private comment: string = "";

    private source: string = "";
    constructor(private mapService: MapService, private overpassService: OverpassService,
                private storageService: StorageService, private authService: AuthService) {
    }

    ngOnInit(): void {
        this.mapService.disableMouseEvent("download-data");
        this.mapService.disableMouseEvent("upload-data");
        this.storageService.editsChanged.subscribe(
            /**
             * @param data - data event is true when storageService.edits change
             */
            (data) => {
                if (data) {
                    this.editsSummary = this.storageService.edits;
                }
            }
        );
    }

    public showDownloadModal(): void {
        this.downloadModal.show();
        this.mapService.disableMouseEvent("modalDownload");
    }

    public hideDownloadModal(): void {
        this.downloadModal.hide();
    }

    public showUploadModal(): void {
        this.uploadModal.show();
        this.mapService.disableMouseEvent("modalUpload");
    }

    public hideUploadModal(): void {
        this.uploadModal.hide();
    }

    private isAuthenticated(): void {
        return this.authService.oauth.authenticated();
    }

    private requestData(requestBody: string): void {
        this.overpassService.requestOverpassData(requestBody);
        this.hideDownloadModal();
    }

    private uploadData(): void {
        this.overpassService.uploadData({ "comment": this.comment, "source": this.source });
    }

    private setQuery(event: any): void {
        this.queryShort = event.target.textContent;
        const filtered = this.favoriteQueries.filter((iter) => {
            return iter.short === event.target.textContent;
        });
        this.queryRaw = decodeURIComponent(filtered[0].raw);
    }

    private hasEdits(): boolean {
        return this.storageService.edits.length > 0;
    }

    private verifyUpload(): void {
        this.overpassService.uploadData({ source: "test upload source", comment: "test upload comment" }, true);
    }
}
