# -*- coding: utf-8 -*-
"""
Catálogo de San Frío: genera las fichas del catálogo dentro de index.html
(entre <!--CATALOG--> y <!--/CATALOG-->).

Uso:  python tools/catalogo.py
Para añadir o quitar productos, edite la lista PRODUCTOS y vuelva a ejecutarlo.

Cada producto: (grupo, categoría visible, nombre, [variantes])
Cada variante: dict con  label (texto del botón; None si solo hay una),
  model (nombre completo para la consulta), fact (dato corto), img (archivo
  en assets/img sin extensión, o None), frig (frigorías, si se conocen),
  slug (dirección de la web antigua /producto/<slug>/, para las redirecciones).
"""
import html, json, pathlib

def V(model, fact, img, slug, label=None, frig=None, slugs=()):
    return dict(label=label, model=model, fact=fact, img=img, frig=frig, slug=slug, extra=list(slugs))

# Orden = orden en la web. Lo principal del negocio va primero.
PRODUCTOS = [
  # ---------------- CLIMATIZACIÓN ----------------
  ("clima", "Split de pared", "Kaysun Casual 35", [V("Kaysun Casual KAY-CD-35DR11", "Split doméstico · gas R-32", "kaysun-casual", "aysun-kay-cd-35dr-8", slugs=["aire-acondicionado-split-pared-kaysun-casual-35"])]),
  ("clima", "Split de pared", "Midea Blanc", [V("Midea Blanc MSMABU-12HRDN1", "3.000 frigorías", "midea-blanc", "midea-blanc-msmabu-12hrdn1", frig=3000)]),
  ("clima", "Split de pared", "AUX Split", [V("AUX Split 4.500 frigorías", "4.500 frigorías", "aux-4500", "aux-split-de-4500-frigorias", frig=4500)]),
  ("clima", "Split de pared", "Giatsu GIA-S18KD", [V("Giatsu Split GIA-S18KD", "4.500 frigorías", "giatsu-s18kd", "giatsu-gia-s18kd", frig=4500)]),
  ("clima", "Split de pared", "Skyluxe con bomba de calor", [
      V("Skyluxe 4.500 frig/h con bomba de calor", "4.500 frigorías · bomba de calor", "skyluxe-4500", "aire-acondicionado-sky-luxe-4500-frig-h", label="4.500 frig", frig=4500),
      V("Skyluxe 6.000 frigorías con bomba de calor", "6.000 frigorías · bomba de calor", "skyluxe-6000", "skyluxe-aire-acondicionado-6-000-frigorias", label="6.000 frig", frig=6000)]),
  ("clima", "Split de pared", "HTW HTW-71IX21D", [V("HTW Split HTW-71IX21D R32", "6.000 frigorías · gas R-32", "htw-71", "htw-split-htw-71ix21d-r32", frig=6000)]),
  ("clima", "Split de pared", "Giatsu GIA-C6-24IX43", [V("Giatsu Split GIA-C6-24IX43", "Split de pared", "giatsu-c6", "giatsu-gia-c6-24ix43")]),
  ("clima", "Portátil", "Johnson portátil", [
      V("Aire acondicionado portátil Johnson JTP9C", "Aire portátil", "johnson-jtp9c", "portatil-johnson-jtp9c", label="JTP9C"),
      V("Aire acondicionado portátil Johnson JTP12H", "Portátil con bomba de calor", "johnson-jtp12h", "aire-acondicionado-portatil-johnson-jtp12h", label="JTP12H")]),
  ("clima", "Conductos", "General ACG-24UI-KA", [V("General conducto ACG-24UI-KA", "Unidad de conductos", "general-conducto", "general-acg-24ui-kk")]),
  ("clima", "Conductos", "Giatsu GIA-D-24IX43", [V("Giatsu conducto GIA-D-24IX43", "Unidad de conductos", "giatsu-conducto", "giatsu-gia-d-24ix43")]),
  ("clima", "Conductos", "Kaysun KPD-71DVR12", [V("Kaysun conducto KPD-71DVR12", "Unidad de conductos", "kaysun-kpd", "kaysun-kpd-71dvr12")]),
  ("clima", "Cassette", "General cassette ACG-24UI-KA", [V("General cassette ACG-24UI-KA", "Cassette de techo", "general-cassette", "general-aug-24ui-kk")]),
  ("clima", "Cassette", "Kaysun KCIS-71DVR13", [V("Kaysun cassette KCIS-71DVR13", "Cassette de techo", "kaysun-kcis", "kaisun-kcis-71dvr12")]),
  ("clima", "Suelo / techo", "Kaysun suelo-techo KPC", [
      V("Kaysun KPC-125DTR11-12", "10.400 frigorías", "kaysun-suelotecho", "kaysun-kpc-125dtr11-12-10-400fg-h", label="10.400 frig", frig=10400),
      V("Kaysun KPC 140DVR.13", "12.100 frigorías", "kaysun-suelotecho", "kaysun-kpc-140dtr-11-12-100fg-h", label="12.100 frig", frig=12100),
      V("Kaysun KPC 160DVR.13", "13.000 frigorías", "kaysun-suelotecho", "kaysun-kpc-160dtr-11-13-000fg-h", label="13.000 frig", frig=13000)]),
  ("clima", "Cortina de aire", "Cortina de aire HTW", [
      V("Cortina de aire HTW-AC9-1400SA1", "90 cm de ancho", "htw-cortina", "htw-ac9-1400sa1", label="90 cm"),
      V("Cortina de aire HTW-AC12-1900SA1", "120 cm de ancho", "htw-cortina", "htw-ac12-1900sa1", label="120 cm"),
      V("Cortina de aire HTW-AC15-2500SA1", "150 cm de ancho", "htw-cortina", "htw-ac15-2500sa1", label="150 cm")]),
  ("clima", "Split de pared", "Movair Split", [V("Movair Split 6.000 frigorías", "6.000 frigorías", None, "aire-acondicionado-split-movair-6000-frigorias", frig=6000)]),
  # ---------------- AEROTERMIA Y SOLAR ----------------
  ("energia", "Aerotermia", "Heatank V3 300 L", [V("Heatank V3 300 L", "Bomba de calor para agua caliente · 300 litros", "heatank-300", "heatank-v3-300l")]),
  ("energia", "Aerotermia", "Giatsu GIA-AT-0-200VAI", [V("Giatsu GIA-AT-0-200VAI", "Aerotermia para agua caliente", "giatsu-aero", "giatsu-gia-at-0-200vai")]),
  ("energia", "Solar térmica", "Hispasun 300-2-T200", [V("Hispasun 300-2-T200", "Termosifón solar · 300 litros", "hispasun-300", "hispasun-300-2-t200-300-litros")]),
  # ---------------- CALEFACCIÓN Y HOSTELERÍA ----------------
  ("calor", "Estufa de terraza", "Flamme pirámide", [
      V("Estufa Flamme pirámide inoxidable", "Pirámide de llama", "cal-flamme-inox", "flamme-inoxidable", label="Inox"),
      V("Estufa Flamme pirámide negra / plata", "Pirámide de llama", "cal-flamme-negra", "flamme-negra-plata", label="Negra y plata")]),
  ("calor", "Estufa de terraza", "Flamme redonda inox", [V("Flamme redonda inox", "Farola de llama", "cal-flamme-redonda", "flamme-redonda-inox")]),
  ("calor", "Estufa de terraza", "Corona baja inox", [V("Estufa Corona baja inox", "Estufa de terraza", "cal-corona-baja", "corona-baja-inox")]),
  ("calor", "Estufa de terraza", "Farola Corona", [V("Farola calefactora Corona negra y blanca", "Negra y blanca", "cal-corona-negra", "farola-calefactora-corona-negra-y-blanca")]),
  ("calor", "Calefactor eléctrico", "Tecna Milán", [V("Farola eléctrica Tecna Milán", "Farola eléctrica", "cal-milan", "farola-electrica-tecna-milan")]),
  ("calor", "Calefactor exterior", "Calefactor Oslo", [V("Calefactor Oslo 3 caras", "Tres caras de calor", "cal-oslo", "calefactor-oslo-3-caras")]),
  ("calor", "Calefactor eléctrico", "Tecna Bari 3", [V("Tecna Bari 3 para sombrillas", "Se instala en la sombrilla", "cal-bari", "tecna-bari-3-para-sombrillas")]),
  ("calor", "Calefactor eléctrico", "Tecna Capri", [V("Calefactor Tecna Capri para colgar", "Para colgar", "cal-capri", "calefactor-tecna-capri-para-colgar")]),
  ("calor", "Calefactor eléctrico", "Airfel WR", [
      V("Calefactor Airfel WR 1750 MG", "Calefactor de pie", "cal-airfel", "calefactor-airfel-wr-1750-mg", label="1750 MG"),
      V("Calefactor Airfel WR 2000 MG", "Calefactor de pie", "cal-airfel", "calefactor-airfel-wr-2000-mg", label="2000 MG")]),
  ("calor", "Hostelería", "Armario expositor PKSS374DTK", [V("Armario expositor de conservación PKSS374DTK", "Frío positivo para hostelería", "armario-expositor", "armario-expositor-positivo-conservacion-pkss374dtk")]),
  # ---------------- PURIFICADORES ----------------
  ("aire", "Purificador", "HTW SPA", [
      V("Purificador HTW 24 SPA", "Purificador de aire", "pur-24spa", "purificador-htw-24-spa", label="24"),
      V("Purificador HTW 36 SPA", "Purificador de aire", "pur-36spa", "purificador-htw-36-spa", label="36"),
      V("Purificador HTW 60 SPA", "Purificador de aire", "pur-60spa", "purificador-htw-60-spa", label="60")]),
  ("aire", "Purificador", "HTW 14 Cube", [V("Purificador HTW 14 Cube", "Serie Cube", "pur-14cube", "purificador-htw-14cube")]),
  ("aire", "Purificador", "HTW Clean", [V("Purificador HTW Clean", "Purificador de aire", "pur-clean", "purificador-htw-clean")]),
  ("aire", "Purificador", "HTW con luz UV", [V("Purificador HTW con luz UV", "Con luz ultravioleta", "pur-uv", "purificador-htw-con-luz-uv")]),
  # ---------------- ELECTRODOMÉSTICOS (secundario) ----------------
  ("hogar", "Horno", "Horno de mesa", [V("Horno de mesa", "Horno eléctrico", "horno-mesa", "horno-de-mesa")]),
  ("hogar", "Horno", "Horno de convección 50 L", [V("Horno eléctrico de convección 50 L", "50 litros", "horno-50l", "horno-electrico-de-conveccion-50-litros")]),
  ("hogar", "Microondas", "Microondas 20 L", [
      V("Microondas 20 L blanco", "20 litros", "micro-20-blanco", "microondas-20-litros-blanco", label="Blanco"),
      V("Microondas 20 L sin grill", "20 litros · sin grill", "micro-20-sin-grill", "microondas-20-litros-sin-grill", label="Sin grill")]),
  ("hogar", "Microondas", "Microondas con grill 28 L", [V("Microondas con grill 28 L inox", "Acero inoxidable", "micro-28-inox", "microondas-con-grill-28-l-inox")]),
  ("hogar", "Placa de cocina", "Placa de inducción", [
      V("Placa de inducción 2 zonas", "60 cm · 2 zonas", "induccion-2", "placa-de-induccion-2-zonas-de-cocinado", label="2 zonas"),
      V("Placa de inducción 3 zonas", "60 cm · 3 zonas", "induccion-3", "placa-de-induccion-3-zonas-de-cocinado", label="3 zonas")]),
  ("hogar", "Placa de cocina", "Vitrocerámica 3 zonas", [V("Vitrocerámica 3 zonas", "60 cm · 3 zonas", "vitro-3", "vitroceramica-3-zonas-de-cocinado")]),
  ("hogar", "Televisor", "Televisor EAS Electric", [
      V("Televisor EAS Electric 32″", "32 pulgadas", "tv-32", "televisor-eas-electric-32", label="32″"),
      V("Televisor EAS Electric 55″", "55 pulgadas", "tv-55", "televisor-eas-electric-55", label="55″")]),
  # ---------------- LED Y MATERIAL ELÉCTRICO (secundario) ----------------
  ("electricidad", "Iluminación LED", "Downlight Apolo 18 W", [V("Downlight LED Apolo 18 W", "6400K · 1500 lm", "led-downlight", "downlight-18w-6400k-intego-ultslim-red-1500lm-blanco")]),
  ("electricidad", "Iluminación LED", "Panel LED 60×60", [V("Panel LED 40 W 60×60", "40 W · 4000K · 3600 lm", "led-panel", "panel-40w-4000k-x2-blanco-3600lm-595x595x1-techtouch")]),
  ("electricidad", "Iluminación LED", "Bombilla GLS E27 regulable", [V("Bombilla LED GLS E27 18 W regulable", "18 W · 6400K · 1521 lm", "led-gls", "bombilla-18w-6400k-gls-e27-1521lm-regulable-10-50-100-12x65d")]),
  ("electricidad", "Iluminación LED", "Bombilla esférica E27", [V("Bombilla LED esférica E27 5 W", "5 W · 6500K · 500 lm", "led-esferica", "bombilla-5w-6500k-blister-e27-esferica-500lm")]),
  ("electricidad", "Iluminación LED", "Bombilla vela E14", [V("Bombilla LED vela E14 4 W", "4 W · 3000K · 400 lm", "led-vela", "bombilla-65w-6400k-hivision-vela-e14-806lm-10x3d")]),
  ("electricidad", "Iluminación LED", "Bombilla dicroica GU10", [V("Bombilla LED dicroica GU10 7 W", "7 W · 3000K · 700 lm", "led-gu10", "bombilla-8w-6400k-hivision-gu10-800lm-55x5d-100o")]),
  ("electricidad", "Material eléctrico", "Diferencial / magnetotérmico", [V("Interruptor diferencial / magnetotérmico", "16 A – 25 A", "el-diferencial", "interruptor-automatico")]),
  ("electricidad", "Material eléctrico", "Manguera eléctrica 3×1,5", [V("Manguera eléctrica 3×1,5", "Por metros", "el-manguera", "manguera-3x15-blanco-neg")]),
  ("electricidad", "Material eléctrico", "Alargadera múltiple Solera", [V("Alargadera múltiple Solera", "Base múltiple", "el-alargadera", "alargadera-multiple-solera")]),
  ("electricidad", "Material eléctrico", "Clavija Schuko a 90º", [V("Clavija Schuko a 90º Solera", "Schuko", "el-clavija", "clavija-shuko-a-90o-solera")]),
  ("electricidad", "Material eléctrico", "Cinta aislante", [
      V("Cinta aislante PVC negra", "PVC negro", "el-cinta", "cinta-aislante", label="Normal"),
      V("Cinta aislante negra ancha 50 mm", "50 mm de ancho", "el-cinta-ancha", "cinta-aislante-negra", label="Ancha")]),
  ("electricidad", "Material eléctrico", "Regleta 4–6 mm", [V("Regleta 4 mm – 6 mm", "Conexión", None, "regleta")]),
  # ---------------- HERRAMIENTAS (secundario) ----------------
  ("herramientas", "Herramienta BlackDiamond", "Kit manómetro R410 / R32", [V("Kit manómetro y mangueras R410/R32 BlackDiamond", "Con mangueras", "bd-manometro", "r410-y-r32")]),
  ("herramientas", "Herramienta BlackDiamond", "Cortatubos BlackDiamond", [
      V("Cortatubos profesional BlackDiamond", "Profesional", "bd-cortatubos", "cortatubos-profesional-blackdiamond", label="Profesional"),
      V("Mini cortatubos BlackDiamond", "Modelo compacto", "bd-cortatubos", "mini-cortatubos-blackdiamond", label="Mini")]),
]

IMGV = "2"  # súbalo cuando cambie fotos con el mismo nombre
SECUNDARIOS = {"hogar", "electricidad", "herramientas"}
SNOW = '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M24 4v40M6.7 14l34.6 20M6.7 34l34.6-20M18 7l6 5 6-5M18 41l6-5 6 5M5 21l7.5 3L5 27M43 21l-7.5 3 7.5 3"/></g></svg>'

def m2(f):
    """Superficie orientativa: 100–125 frigorías por m² (clima de Andalucía)."""
    return f"{round(f / 125)}–{round(f / 100)} m²" if f else ""

def esc(s): return html.escape(s, quote=True)

def media(v, name):
    if v["img"]:
        return f'<img src="assets/img/{v["img"]}.webp?v={IMGV}" alt="{esc(v["model"])}" loading="lazy" width="640" height="640">'
    return f'<span class="p-ph">{SNOW}<span>Foto próximamente</span></span>'

def card(g, cat, name, vs):
    v0 = vs[0]
    slugs = [s for v in vs for s in [v["slug"]] + v["extra"]]
    frigs = [v["frig"] for v in vs if v["frig"]]
    data = [dict(label=v["label"], model=v["model"], fact=v["fact"], img=v["img"], frig=v["frig"], m2=m2(v["frig"]),
                 slugs=[v["slug"]] + v["extra"]) for v in vs]
    words = " ".join([name, cat] + [v["model"] for v in vs]).lower()
    out = [f'<article class="p" id="p-{v0["slug"]}" data-g="{g}" data-name="{esc(words)}" data-slugs="{" ".join(slugs)}"'
           + (f' data-frig="{" ".join(str(x) for x in frigs)}"' if frigs else "")
           + f' data-variants="{esc(json.dumps(data, ensure_ascii=False))}">']
    out.append(f'<button class="p-media" type="button" aria-label="Ver ficha: {esc(name)}">{media(v0, name)}</button>')
    out.append(f'<p class="p-cat">{esc(cat)}</p><h3 class="p-name">{esc(name)}</h3>')
    out.append(f'<p class="p-fact">{esc(v0["fact"])}</p>')
    out.append(f'<p class="p-m2"{"" if v0["frig"] else " hidden"}>Orientativo: {m2(v0["frig"])}</p>')
    if len(vs) > 1:
        btns = "".join(f'<button type="button" data-i="{i}" aria-pressed="{"true" if i == 0 else "false"}">{esc(v["label"])}</button>' for i, v in enumerate(vs))
        out.append(f'<div class="p-var" role="group" aria-label="Elegir modelo de {esc(name)}">{btns}</div>')
    out.append(f'<div class="p-actions"><button class="p-ask" type="button" data-product="{esc(v0["model"])}">Consultar</button>'
               f'<button class="p-more" type="button">Ficha</button></div></article>')
    return "".join(out)

def main():
    root = pathlib.Path(__file__).resolve().parent.parent
    f = root / "index.html"
    s = f.read_text(encoding="utf-8")
    cards, sep = [], False
    for g, cat, name, vs in PRODUCTOS:
        if g in SECUNDARIOS and not sep:
            cards.append('<p class="grid-sep" data-sep>También tenemos: electrodomésticos, iluminación LED, material eléctrico y herramientas</p>')
            sep = True
        cards.append(card(g, cat, name, vs))
    a, b = s.index("<!--CATALOG-->") + len("<!--CATALOG-->"), s.index("<!--/CATALOG-->")
    f.write_text(s[:a] + "\n" + "\n".join(cards) + "\n" + s[b:], encoding="utf-8")
    n = len(PRODUCTOS); nv = sum(len(v) for *_, v in PRODUCTOS)
    print(f"{n} fichas ({nv} modelos)")

if __name__ == "__main__":
    main()
