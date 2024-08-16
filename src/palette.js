import fs from "fs";
import html2png from "html2png";

const palette = {
  background: "#141414",
  colors: {
    white: "#f1f1f1",
    red: "#E87F7E",
    orange: "#DE935F",
    yellow: "#F0C674",
    green: "#B5BD68",
    blue: "#81A2BE",
    purple: "#B294BB",
    cyan: "#8ABEB7",
  },
};

function calculateContrastRatio(color1, color2) {
  const color1Luminance = calculateLuminance(color1);
  const color2Luminance = calculateLuminance(color2);

  const lighterColor = Math.max(color1Luminance, color2Luminance);
  const darkerColor = Math.min(color1Luminance, color2Luminance);

  return (lighterColor + 0.05) / (darkerColor + 0.05);
}

function calculateLuminance(color) {
  const rgb = hexToRgb(color);
  const srgb = rgb
    .map((c) => c / 255)
    .map((c) => {
      if (c <= 0.03928) {
        return c / 12.92;
      } else {
        return Math.pow((c + 0.055) / 1.055, 2.4);
      }
    });

  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

const contrastRatios = {};

for (let color in palette.colors) {
  contrastRatios[color] = calculateContrastRatio(
    palette.colors[color],
    palette.background
  );
}

let table = `<body style="background-color: ${palette.background}">
<style>
table {
    width: 200px;
    border-collapse: collapse;
    table-layout: fixed;
    font-family: monospace;
    font-size: 14px;
    color: ${palette.colors.white};
}
</style>
<table>
<tr>
<th style="width: 105px; height: 21px;"></th>`;

for (let color in palette.colors) {
  table += `<th style="width: 63px">${color}</th>`;
}

table += `</tr>
<tr>
<td style="text-align: right; padding: 1em;">Background #141414</td>`;

for (let color in palette.colors) {
  table += `<td style="background-color: ${palette.background}; color: ${palette.colors[color]}; text-align: center; font-weight: bold; font-size: 21px;">Aa</td>`;
}

table += `</tr>
<tr>
<td style="text-align: right; padding: 1em;">Contrast ratio*</td>`;

for (let ratio in contrastRatios) {
  table += `<td style="background-color: ${palette.colors[ratio]}; color: ${
    palette.background
  };text-align: center; font-family: sans;">${contrastRatios[ratio].toFixed(
    2
  )}</td>`;
}

table += `</tr>
</table>
</body>`;

let ss = html2png({ width: 740, height: 280, browser: "chrome" });

ss.render(table, function (err, data) {
  if (err) {
    console.error(err);
  } else {
    fs.writeFileSync("./img/palette.png", data);
  }
  ss.close();
});
