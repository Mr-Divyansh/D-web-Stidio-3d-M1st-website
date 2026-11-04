(function () {
    "use strict";

    function T(n, e, f) {
        return Math.max(e, Math.min(f, n))
    }

    const l = D();

    function D() {
        const n = new ArrayBuffer(4);
        const e = new Float32Array(n);
        const f = new Uint32Array(n);
        const i = new Uint32Array(512);
        const a = new Uint32Array(512);

        for (let t = 0; t < 256; ++t) {
            const o = t - 127;
            o < -27
                ? (i[t] = 0, i[t | 256] = 32768, a[t] = 24, a[t | 256] = 24)
                : o < -14
                    ? (i[t] = 1024 >> -o - 14, i[t | 256] = 1024 >> -o - 14 | 32768, a[t] = -o - 1, a[t | 256] = -o - 1)
                    : o <= 15
                        ? (i[t] = o + 15 << 10, i[t | 256] = o + 15 << 10 | 32768, a[t] = 13, a[t | 256] = 13)
                        : o < 128
                            ? (i[t] = 31744, i[t | 256] = 64512, a[t] = 24, a[t | 256] = 24)
                            : (i[t] = 31744, i[t | 256] = 64512, a[t] = 13, a[t | 256] = 13)
        }

        const r = new Uint32Array(2048);
        const s = new Uint32Array(64);
        const c = new Uint32Array(64);

        for (let t = 1; t < 1024; ++t) {
            let o = t << 13, p = 0;
            for (; (o & 8388608) === 0;) o <<= 1, p -= 8388608;
            o &= -8388609;
            p += 947912704;
            r[t] = o | p
        }

        for (let t = 1024; t < 2048; ++t) r[t] = 939524096 + (t - 1024 << 13);

        for (let t = 1; t < 31; ++t) s[t] = t << 23;
        s[31] = 1199570944;
        s[32] = 2147483648;

        for (let t = 33; t < 63; ++t) s[t] = 2147483648 + (t - 32 << 23);
        s[63] = 3347054592;

        for (let t = 1; t < 64; ++t) t !== 32 && (c[t] = 1024);

        return {
            floatView: e,
            uint32View: f,
            baseTable: i,
            shiftTable: a,
            mantissaTable: r,
            exponentTable: s,
            offsetTable: c
        }
    }

    function H(n) {
        Math.abs(n) > 65504;
        n = T(n, -65504, 65504);
        l.floatView[0] = n;
        const e = l.uint32View[0];
        const f = e >> 23 & 511;
        return l.baseTable[f] + ((e & 8388607) >> l.shiftTable[f])
    }

    function U(n) {
        const e = n >> 10;
        return l.uint32View[0] = l.mantissaTable[l.offsetTable[e] + (n & 1023)] + l.exponentTable[e], l.floatView[0]
    }

    class _ {
        static toHalfFloat(e) {
            return H(e)
        }
        static fromHalfFloat(e) {
            return U(e)
        }
    }

    typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: { revision: "180" } }));
    typeof window < "u" && (window.__THREE__ || (window.__THREE__ = "180"));

    const E = Array(1024).fill(0).map((n, e) => Math.pow(e / 255 * .9478672986 + .0521327014, 2.4));

    function V(n) {
        return n / 255 < .04045 ? n / 255 * .0773993808 : n < 1024 ? E[~~n] : Math.pow(n / 255 * .9478672986 + .0521327014, 2.4)
    }

    function O(n, e) {
        const f = n.substring(n.indexOf("<"), n.lastIndexOf(">") + 1);
        if (/<Container:Directory[\s>]/.test(f)) return;
        const i = f.match(/<rdf:Description\b[^>]*>/);
        if (!i) return;
        const a = r => {
            const s = i[0].match(new RegExp(`hdrgm:${r}\\s*=\\s*["']([^"']*)["']`));
            return s ? s[1] : null
        };
        e.version = a("Version");
        e.baseRenditionIsHDR = a("BaseRenditionIsHDR") === "True";
        e.gainMapMin = parseFloat(a("GainMapMin") || 0);
        e.gainMapMax = parseFloat(a("GainMapMax") || 1);
        e.gamma = parseFloat(a("Gamma") || 1);
        e.offsetSDR = parseFloat(a("OffsetSDR") / (1 / 64));
        e.offsetHDR = parseFloat(a("OffsetHDR") / (1 / 64));
        e.hdrCapacityMin = parseFloat(a("HDRCapacityMin") || 0);
        e.hdrCapacityMax = parseFloat(a("HDRCapacityMax") || 1)
    }

    function I(n) {
        const e = {
            version: null,
            baseRenditionIsHDR: null,
            gainMapMin: null,
            gainMapMax: null,
            gamma: null,
            offsetSDR: null,
            offsetHDR: null,
            hdrCapacityMin: null,
            hdrCapacityMax: null
        };
        const f = new TextDecoder();
        const i = new DataView(n);
        let a = 0;
        const r = [];

        for (; a < i.byteLength;) {
            const t = i.getUint8(a);
            if (t === 255) {
                const o = i.getUint8(a + 1);
                [216, 224, 225, 226].includes(o)
                    ? (r.push({ sectionType: o, section: [t, o], sectionOffset: a + 2 }), a += 2)
                    : (r[r.length - 1].section.push(t, o), a += 2)
            } else r[r.length - 1].section.push(t), a++
        }

        let s, c;

        for (const { sectionType: t, section: o, sectionOffset: p } of r)
            if (t === 225) O(f.decode(new Uint8Array(o)), e);
            else if (t === 226) {
                const g = new DataView(new Uint8Array(o.slice(2)).buffer);
                if (g.getUint32(2, !1) === 1297106432) {
                    const h = g.getUint32(6) === 1229531648;
                    const u = 60;
                    const d = g.getUint32(u, h);
                    const x = g.getUint32(u + 4, h);
                    const w = g.getUint32(u + 16, h);
                    const M = g.getUint32(u + 20, h) + p + 6;
                    s = new Uint8Array(i.buffer, x, d);
                    c = new Uint8Array(i.buffer, M, w)
                }
            }

        if (!e.version) throw new Error("not a valid UltraHDR image");
        if (!s || !c) throw new Error("could not parse UltraHDR images");

        return { xmp: e, primary: s, gainmap: c }
    }

    async function S(n) {
        const { xmp: e, primary: f, gainmap: i } = I(n);
        const [a, r] = await Promise.all([
            createImageBitmap(new Blob([f], { type: "image/jpeg" })),
            createImageBitmap(new Blob([i], { type: "image/jpeg" }))
        ]);

        if (a.width / a.height !== r.width / r.height) throw new Error("aspect ratio mismatch between SDR and gain map");

        const s = a.width;
        const c = a.height;
        const t = new OffscreenCanvas(s, c).getContext("2d", { willReadFrequently: !0, colorSpace: "srgb" });

        t.drawImage(r, 0, 0, r.width, r.height, 0, 0, s, c);
        const o = t.getImageData(0, 0, s, c, { colorSpace: "srgb" }).data;
        t.drawImage(a, 0, 0);
        const p = t.getImageData(0, 0, s, c, { colorSpace: "srgb" }).data;
        a.close();
        r.close();

        const g = new Uint16Array(p.length).fill(23544);
        const h = Math.sqrt(Math.pow(1.8, e.hdrCapacityMax));
        const u = (Math.log2(h) - e.hdrCapacityMin) / (e.hdrCapacityMax - e.hdrCapacityMin);
        const d = Math.min(Math.max(u, 0), 1);
        const x = e.gamma === 1;

        for (let w = 0; w < p.length; w += 4) {
            const M = w / 4 % s;
            const A = Math.floor(w / 4 / s);
            for (let m = 0; m < 3; m++) {
                const F = p[w + m];
                const y = o[(A * s + M) * 4 + m] / 255;
                const b = x ? y : Math.pow(y, 1 / e.gamma);
                const R = e.gainMapMin * (1 - b) + e.gainMapMax * b;
                const C = (F + e.offsetSDR) * (R * d === 0 ? 1 : Math.pow(2, R * d)) - e.offsetHDR;
                const B = Math.min(Math.max(V(C), 0), 65504);
                g[w + m] = _.toHalfFloat(B)
            }
        }

        return { data: g, width: s, height: c }
    }

    self.onmessage = async n => {
        const { id: e, buf: f } = n.data;
        try {
            const i = await S(f);
            self.postMessage({ id: e, ...i }, [i.data.buffer])
        } catch (i) {
            self.postMessage({ id: e, error: String((i == null ? void 0 : i.message) || i) })
        }
    }
})();