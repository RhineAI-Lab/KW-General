import {CreateText, ExtrudePolygon, Mesh} from "@babylonjs/core";
import KE from "../../KE";

export default class Writer {
    static font: any = null

    static async init() {
        this.font = await (await fetch("/fonts/Sans_Regular.json")).json();
        // const extrudedPolygon = ExtrudePolygon("polygon", options, KE.scene);
    }

    static hasInit() {
        return Writer.font != null
    }

    static write(text: string, options: any): Mesh | null {
        if (!this.hasInit()) return null
        return CreateText('text', text, this.font, options, KE.scene)
    }
}

