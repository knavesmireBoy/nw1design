/*jslint nomen: true */
/*global nW1: false */
/* eslint-disable indent */
/* eslint-disable max-len */

  if (!window.nW1) {
    window.nW1 = {};
  }


  function getUrlParameter(sParam) {
    let sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split("&"),
      sParameterName,
      i;
    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split("=");
      if (sParameterName[0] == sParam) {
        return typeof sParameterName[1] === "undefined"
          ? true
          : decodeURIComponent(sParameterName[1]);
      }
    }
    return false;
  }
  const intro1 =
      "My colleague, Lylaani Dixon, has very kindly allowed me to repurpose one of her old sites as a playground for learning React. The existing <a href='http://www.nw1design.com'>site</a> - maintained largely for sentimental reasons - deploys an <a href='https://www.projectseven.com/support/updatepages/ssm.htm'>old dreamweaver javascript library</a> on the portfolio pages to deliver a rather complex gallery/slideshow/accordion that would provide a challenge to recreate both in React and pure ES6.",
    intro2 =
      "Lylaani had been a freelance designer for a number of years when she was approached by &ldquo;The Rory Peck Trust&rdquo; to not only design and maintain their website but also to produce various print items, most notably the programme for the annual <a href='https://rorypecktrust.org/'>The Rory Peck Awards</a> which we had printed (and designed, sort of) for the previous two years. It was better for all concerned to have a bona fide - and London based - designer to assemble the information and shape the design for publication and we would collaborate closely over the ensuing decade.",
    intro3 =
      "This site is the pure JS version and my first written entirely with ES6 which I was keen to explore further as a prelude to attempting the <a href='https://knavesmireboy.github.io/nw1design-react'>React</a> version. The chief difference is that the React version utilises the browsers' localStorage API and markdown-esque markup to perform rudimentary editing of the main content, mimicking the functionality of a full-blown CMS. I eschewed the use of &ldquo;create-react-app&rdquo; in order to gain some exposure to webpack and the modern JS ecosystem. Due to its primary focus the site will not currently degrade so well in older browsers. I will continue to use the site to explore further features of the framework.",
      intro4 = "Lylanni has moved on from NW1 and her most recent endeavours can be <a href='https://parish-council.website'>found here</a>.";

  const urlParams = window.URLSearchParams
    ? new window.URLSearchParams(window.location.search)
    : {};
  if (!urlParams.has) {
    urlParams.has = getUrlParameter;
  }
  if (urlParams.has("cv")) {
    let meta = nW1.meta,
      utils = nW1.utils,
      curry2 = meta.curryRight(2),
      curryL2 = meta.curryLeft(2),
      compose = meta.compose,
      pass = meta.pass,
      append = utils.append,
      doMake = utils.doMake,
      head = meta.$Q("header"),
      anc = meta.$Q("header a"),
      setHTML = curry2(utils.setInnerHTML),
      //reverse order to utilise spread syntax below ...paras
      intros = [intro4, intro3, intro2, intro1],
      dopara = text => compose(utils.getParent, text.wrap(pass), append(doMake("p"))),
      texts = intros.map(intro => setHTML(intro)),
      paras = texts.map(dopara),
      doLink = compose(
        ...paras,
        utils.getParent2,
        append(utils.doTextNow("close")),
        utils.setHref,
        utils.setId("exit").wrap(pass),
        append(doMake("a"))
      ),
      ptl = meta.mittelFactory(false)(meta.invokePair, "insertBefore", anc);
    compose(
      doLink,
      utils.setId("intro").wrap(pass),
      curryL2(ptl)(head),
      doMake
    )("div");
  }
