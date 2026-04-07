#!/usr/bin/env bun

import { BoxRenderable, RGBA, ScrollBoxRenderable, TextRenderable, createCliRenderer } from "@opentui/core"

const thai = [
  "ภาษาไทยเป็นภาษาที่มีความสวยงามและซับซ้อนมาก มีพยัญชนะ 44 ตัว สระ 32 รูป และวรรณยุกต์ 4 รูป",
  "ตัวอย่างคำที่มีสระและวรรณยุกต์ซ้อนกัน: กำ, น้ำ, ย่ำ, ทำ, ซ้ำ, ค่ำ, เช้า, เข้า, เก้า",
  "สระลอยและสระเปลี่ยนรูปทำให้ภาษาไทยมีความพิเศษ เช่น เมือง แมว ไม้ ใหม่ เอื้อม ถ้อยคำ",
  "ภาษาไทยมีระบบการเขียนที่ไม่เว้นวรรคระหว่างคำ ทำให้การอ่านต้องอาศัยความเข้าใจของผู้อ่าน",
  "ตัวอย่างเสียงวรรณยุกต์: มา ม่า ม้า หมา หม่า หม้า ขาว ข่าว ข้าว เข้า",
]

const wide = [
  "東京都  北京市  서울시  大阪府  名古屋  横浜市  上海市",
  "👨‍👩‍👧‍👦  👩🏽‍💻  🏳️‍🌈  🇺🇸  🇯🇵  🎉🎊🎈  家族  絵文字",
  "こんにちは世界  你好世界  안녕하세요  สวัสดี  مرحبا",
]

const body = Array.from({ length: 18 }, (_, i) => [thai[i % thai.length], wide[i % wide.length], ""].join("\n")).join(
  "\n",
)

const main = async () => {
  const renderer = await createCliRenderer({ exitOnCtrlC: true })
  const root = new BoxRenderable(renderer, { id: "root" })
  let show = false

  const head = new TextRenderable(renderer, {
    id: "head",
    position: "absolute",
    left: 1,
    top: 0,
    zIndex: 100,
    selectable: false,
  })
  const scroll = new ScrollBoxRenderable(renderer, {
    id: "scroll",
    position: "absolute",
    left: 0,
    top: 1,
    width: renderer.terminalWidth,
    height: renderer.terminalHeight - 1,
    border: true,
    title: "OpenTUI Unicode Repro",
    titleAlignment: "center",
  })
  const text = new TextRenderable(renderer, {
    id: "text",
    content: body,
  })
  const scrim = new BoxRenderable(renderer, {
    id: "scrim",
    position: "absolute",
    left: 0,
    top: 1,
    width: renderer.terminalWidth,
    height: renderer.terminalHeight - 1,
    backgroundColor: RGBA.fromInts(0, 0, 0, 150),
    zIndex: 50,
  })

  scroll.add(text)
  scrim.visible = show
  renderer.root.add(root)
  root.add(head)
  root.add(scroll)
  root.add(scrim)

  const sync = () => {
    head.content = [
      "Thai scroll repro: opentui#479",
      "Overlay/ghosting repro: opentui#791",
      `D toggle overlay (${show ? "on" : "off"}) | Up/Down or J/K scroll | PageUp/PageDown jump | Home/End bounds | Ctrl+C exit`,
    ].join(" | ")
    scroll.width = renderer.terminalWidth
    scroll.height = Math.max(3, renderer.terminalHeight - 1)
    scrim.width = renderer.terminalWidth
    scrim.height = Math.max(0, renderer.terminalHeight - 1)
    scrim.visible = show
  }

  renderer.keyInput.on("keypress", (evt) => {
    const name = evt.name?.toLowerCase()
    if (name === "down" || name === "j") {
      scroll.scrollDown()
      renderer.requestRender()
      return
    }
    if (name === "up" || name === "k") {
      scroll.scrollUp()
      renderer.requestRender()
      return
    }
    if (name === "pagedown" || name === "space") {
      scroll.scrollBy(8)
      renderer.requestRender()
      return
    }
    if (name === "pageup") {
      scroll.scrollBy(-8)
      renderer.requestRender()
      return
    }
    if (name === "home") {
      scroll.scrollTo(0)
      renderer.requestRender()
      return
    }
    if (name === "end") {
      scroll.scrollTo(scroll.scrollHeight)
      renderer.requestRender()
      return
    }
    if (name !== "d") return
    show = !show
    sync()
    renderer.requestRender()
  })

  renderer.on("resize", () => {
    sync()
    renderer.requestRender()
  })

  sync()
  renderer.requestRender()
  renderer.start()
}

await main()
