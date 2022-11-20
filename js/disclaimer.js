/*jslint nomen: true */
/*global nW1: false */
/* eslint-disable indent */
/* eslint-disable max-len */

/*
  Lylaani, should you ever consent to allowing me to publish this to a waiting world I would need to provide some sort of disclaimer. Along these lines...
  */

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
      "My colleague, Lylaani Dixon, has very kindly allowed me to repurpose one of her old sites as a playground for learning React. The existing site - maintained  largely for sentimental reasons - deploys an <a href='https://www.projectseven.com/support/updatepages/ssm.htm'>ancient javascript library</a> on the portfolio pages to deliver a rather complex gallery/slideshow/accordion that would provide a challenge to recreate both in React and pure ES6.",
    intro2 =
      "Lylaani had been a freelance designer for a number of years when she was approached by &ldquo;The Rory Peck Trust&rdquo; to not only design and maintain their website but also to produce various print items, most notably the programme for the annual <a href='https://rorypecktrust.org/'>The Rory Peck Awards</a> which we had printed (and designed, sort of) for the previous two years. It was better for all concerned to have a bona fide - and London based - designer to assemble the information and shape the design for publication and we would collaborate closely over the ensuing decade.",
    intro3 =
      "This site is the vanilla JS version. The experimental <a href='https://knavesmireboy.github.io/minchinhampton?cv/'>React</a> version utilises the browsers' localStorage API and markdown-esque markup to perform rudimentary editing of the main content, mimicking the functionality of a full-blown CMS. I eschewed the use of &ldquo;create-react-app&rdquo; in order to gain some exposure to webpack and the modern JS ecosystem. Due to its primary focus the site will not degrade well in older browsers, but I will continue to use the site to explore further features of the framework, and in due course integrate a proper back-end. Lylanni has moved on from NW1 and her most recent endeavours are <a href='https://parish-council.website'>located here</a>.";

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
      doMakeNow = utils.doMakeNow,
      head = meta.$Q("header"),
      anc = meta.$Q("header a"),
      text1 = curry2(utils.setInnerHTML)(intro1),
      text2 = curry2(utils.setInnerHTML)(intro2),
      text3 = curry2(utils.setInnerHTML)(intro3),
      //need fresh refs to paras
      para1 = meta.compose(utils.getParent, text1.wrap(meta.pass), utils.append(doMakeNow("p"))),
      para2 = meta.compose(utils.getParent, text2.wrap(meta.pass), utils.append(doMakeNow("p"))),
      para3 = meta.compose(text3, utils.append(doMakeNow("p"))),
      doLink = meta.compose(
        para3,
        para2,
        para1,
        utils.getParent2,
        utils.append(utils.doTextNow("close")),
        utils.setHref,
        utils.setId("exit").wrap(meta.pass),
        utils.append(doMakeNow("a"))
      ),
      ptl = meta.mittelFactory(false)(meta.invokePair, "insertBefore", anc);
    meta.compose(
      doLink,
      utils.setId("intro").wrap(meta.pass),
      curryL2(ptl)(head),
      doMakeNow
    )("div");
  }