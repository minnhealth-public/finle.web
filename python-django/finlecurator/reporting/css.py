CSS: str = """
    /* Title, Form */

    h1 {
        text-align: center;
    }

    form {
      width: 50%;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 24px;
    }

    input[type=submit] {
      width: 100%;
      margin-bottom: 8px;
      color: black;
      background-color: #ccc;
      padding: 14px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    input[type=submit]:hover {
      color: white;
      background-color: #000;
    }

    /* Channels, Channel, and Video Containers */

    div.channel {
      margin: 32px;
      padding: 16px;
      width: fit-content;
      background: #fff;
    }

    div.channels>div.channel:nth-of-type(even) {
      background: #eee;
    }

    div.video {
      margin: 32px;
      padding: 16px;
      width: fit-content;
      background: #fff;
    }

    /* tables (all) - Wrap cell content  */

    table {
      border-collapse: collapse;
      table-layout: fixed;
    }

    table td {
      word-wrap: break-word;
    }

    /* tables (master) - headers (rows 1 and 2) */

    table.master tr:first-child {
      height: 1.5em;
    }

    table.master tr:first-child td:first-child {
      vertical-align: top;
    }

    table.master tr:first-child td:first-child svg {
      width: 64px;
      height: 64px;
    }

    table.master tr:first-child td:nth-child(2) {
      font-size: 1.5em;
      font-weight: bold;
      padding-top: 6px;
      padding-left: 6px;
      pointer-events: all;
    }

    table.master tr:nth-child(2) td:first-child {
      color: #444;
      font-size: 0.75em;
      padding-left: 6px;
      vertical-align: top;
    }

    /* table (master) - clip diagrams (row 3) */

    td.clip-diagram {
      padding-top: 12px;
      padding-bottom: 12px;
    }

    /* table (master) - rule violations (rows 4+) */

    td.violation-label {
      font-size: 1em;
      font-weight: bold;
      text-decoration: underline;
      padding-top: 4px;
      padding-bottom: 4px;
    }

    table tr.violation {
      border-bottom: 1px solid #bbb;
    }

    table tr.violation:last-child {
      border-bottom: 0;
    }

    table tr.violation td:nth-child(1) {
      color: #444;
      font-size: 0.75em;
      text-align: center;
      vertical-align: middle;
    }

    table tr.error td:nth-child(1) {
      color: #f00;
    }

    table tr.violation td:nth-child(2) {
      color: #444;
      font-size: 0.75em;
      padding-left: 6px;
      vertical-align: middle;
    }

    table tr.violation td:nth-child(3) {
      font-size: 1em;
      padding-left: 6px;
    }

    svg.error {
      /* See https://isotropic.co/tool/hex-color-to-css-filter/ */
      filter: invert(21%) sepia(86%) saturate(4843%) hue-rotate(353deg)
        brightness(90%) contrast(129%);
    }

    svg rect {
      pointer-events: all;
    }

    /* popups and tables (detail) */

    div.popup {
      color: white;
      width: 400px;
      padding: 20px;
      font-family: Arial, sans-serif;
      font-size: 10pt;
      background-color: black;
      border-radius: 6px;
      position: absolute;
      display: none;
    }

    div.popup::before {
      content: "";
      width: 12px;
      height: 12px;
      transform: rotate(45deg);
      background-color: black;
      position: absolute;
      left: -6px;
      top: 68px;
    }

    table.popup th {
      padding-bottom: 10px;
      text-align: left;
      vertical-align: top;
    }

    table.popup td {
      padding-left: 6px;
      padding-bottom: 10px;
      vertical-align: top;
    }

    table.popup td ul {
        padding: 0px;
        margin: 0px;
    }

    .hidden {
        display: none;
    }

"""
