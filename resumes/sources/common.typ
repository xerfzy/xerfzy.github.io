// Shared data and layout for every resume. Contact details and education live
// only here; the five role files import this file and add their own content.
//
// Layout rules (ATS): one column, standard section headings, real text (no
// images or icons), no tables for layout, ASCII punctuation, no ligatures and
// no hyphenation so that every word extracts cleanly with pdftotext.

#let person = (
  name: "Sre Cibi Varsshan K",
  email: "srecibi9@gmail.com",
  github: "github.com/xerfzy",
  github-secondary: "github.com/thenamelessone888",
  // PLACEHOLDERS - fill in before sending if wanted; `none` hides the field.
  phone: none,     // e.g. "+91 XXXXX XXXXX"
  linkedin: "linkedin.com/in/sre-cibi-varsshan-k-34149a287",
  location: none,  // e.g. "Chennai, India"
  website: "xerfzy.github.io",  // portfolio; live once the repo is renamed to xerfzy.github.io
)

#let education = (
  school: "Vellore Institute of Technology, Chennai",
  degree: "B.Tech Computer Science and Engineering (Artificial Intelligence and Machine Learning)",
  dates: "Expected 2027",
)

// Published patent application - never described as granted.
#let patent-entry = [
  *Indian Patent Application IN202641060337 A1* (published application, not granted) | May 2026 \
  "A System for Swarm of Drone for Crowed Behaviour Analysis". Application No. 202641060337, filed 12 May 2026, published 22 May 2026. Inventors: Sre Cibi Varsshan K, D Kavitha. Applicant: Vellore Institute of Technology, Chennai.
]

// "github.com/user/repo" shown as text, linked over https.
#let repo(path) = link("https://github.com/" + path, "github.com/" + path)

#let section(title) = block(
  above: 1.0em, below: 0.55em, width: 100%,
  stroke: (bottom: 0.5pt), inset: (bottom: 2.5pt),
  text(size: 11pt, weight: "bold", upper(title)),
)

// One project: name, stack and date on the first line; repository on the second.
// Dates stay inline (not right-aligned) so plain-text extraction keeps reading order.
#let project(name, stack, date, url: none, body) = {
  block(breakable: false, above: 0.85em, below: 0em)[
    *#name* | #stack | #date \
    #if url != none { text(size: 9.3pt, url) }
    #body
  ]
}

#let resume(subtitle: none, keywords: (), secondary-github: false, body) = {
  set document(
    title: person.name + " - Resume" + if subtitle != none { " - " + subtitle } else { "" },
    author: person.name,
    keywords: keywords,
    date: none,
  )
  set page(paper: "a4", margin: (x: 1.5cm, top: 1.2cm, bottom: 1.2cm), numbering: none)
  set text(
    // Liberation Sans is metric-compatible with Arial; DejaVu Sans is the fallback.
    font: ("Liberation Sans", "DejaVu Sans"),
    size: 10pt,
    lang: "en",
    ligatures: false,
    discretionary-ligatures: false,
    historical-ligatures: false,
    hyphenate: false,
  )
  set smartquote(enabled: false)
  // Never break a line inside a hyphenated term ("post-processing", "SHA-256"):
  // text extractors join such breaks and drop the hyphen.
  show regex("[\w+#./]+(?:-[\w+#./]+)+"): it => box(it)
  set par(justify: false, leading: 0.5em, spacing: 0.55em)
  set list(indent: 0.6em, body-indent: 0.45em, spacing: 0.42em, marker: [•])
  show link: it => it

  // Header: name, then one line of contact details.
  align(center)[
    #text(size: 17pt, weight: "bold", person.name) \
    #v(-0.3em)
    #{
      let parts = ()
      if person.location != none { parts.push(person.location) }
      if person.phone != none { parts.push(person.phone) }
      parts.push(link("mailto:" + person.email, person.email))
      parts.push(link("https://" + person.github, person.github))
      if secondary-github { parts.push(link("https://" + person.github-secondary, person.github-secondary)) }
      if person.linkedin != none { parts.push(link("https://" + person.linkedin, person.linkedin)) }
      if person.website != none { parts.push(link("https://" + person.website, person.website)) }
      parts.join(" | ")
    }
  ]

  section("Education")
  [*#education.school* | #education.dates \
   #education.degree]

  body
}
