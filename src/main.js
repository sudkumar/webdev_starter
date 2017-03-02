import $ from "jquery"
import "styles/core.scss"

$(document).ready(() => {
    setTimeout(function () {
        $("h1").addClass("card").text("Text from main.js")
    }, 1000)
})
