// webpack require() definition for ts-loader
// source: https://github.com/TypeStrong/ts-loader

///<reference path="../../node_modules/@types/angular/index.d.ts"/>
///<reference path="../../node_modules/@types/core-js/index.d.ts"/>
///<reference path="../../node_modules/@types/leaflet/index.d.ts"/>

declare var require: {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};
