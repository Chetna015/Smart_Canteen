/**
 * Lightweight, zero-dependency QR Code SVG generator (ISO/IEC 18004, Versions 1-4, Byte Mode, ECC-L).
 * Supports up to 78 UTF-8 bytes (more than enough for LAN URLs like http://192.168.x.x:3000).
 */
(function (globalScope) {
  'use strict';

  // GF(256) with primitive polynomial 0x11d
  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) {
    EXP[i] = EXP[i - 255];
  }

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[LOG[a] + LOG[b]];
  }

  function rsGeneratorPoly(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i += 1) {
      const next = new Array(poly.length + 1).fill(0);
      const factor = EXP[i];
      for (let j = 0; j < poly.length; j += 1) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], factor);
      }
      poly = next;
    }
    return poly;
  }

  function rsEncode(data, ecCount) {
    const gen = rsGeneratorPoly(ecCount);
    const res = new Uint8Array(data.length + ecCount);
    res.set(data, 0);
    for (let i = 0; i < data.length; i += 1) {
      const coef = res[i];
      if (coef !== 0) {
        for (let j = 0; j < gen.length; j += 1) {
          res[i + j] ^= gfMul(gen[j], coef);
        }
      }
    }
    return res.slice(data.length);
  }

  // Versions 1-4 ECC-L specs (single RS block for all four)
  const SPECS = [
    { version: 1, size: 21, dataCodewords: 19, ecCodewords: 7, maxBytes: 17, align: [] },
    { version: 2, size: 25, dataCodewords: 34, ecCodewords: 10, maxBytes: 32, align: [18] },
    { version: 3, size: 29, dataCodewords: 55, ecCodewords: 15, maxBytes: 53, align: [22] },
    { version: 4, size: 33, dataCodewords: 80, ecCodewords: 20, maxBytes: 78, align: [26] },
  ];

  function encodeDataBits(text) {
    const bytes = new TextEncoder().encode(text);
    const spec = SPECS.find((s) => bytes.length <= s.maxBytes);
    if (!spec) {
      throw new Error('URL too long for QR V1-V4');
    }

    const bits = [];
    const pushBits = (val, len) => {
      for (let i = len - 1; i >= 0; i -= 1) {
        bits.push((val >>> i) & 1);
      }
    };

    // Byte mode = 0100, 8-bit char count for versions 1-9
    pushBits(0b0100, 4);
    pushBits(bytes.length, 8);
    for (const b of bytes) pushBits(b, 8);

    const totalDataBits = spec.dataCodewords * 8;
    const terminatorLen = Math.min(4, totalDataBits - bits.length);
    pushBits(0, terminatorLen);

    while (bits.length % 8 !== 0) bits.push(0);

    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    while (bits.length < totalDataBits) {
      pushBits(padBytes[padIdx % 2], 8);
      padIdx += 1;
    }

    const dataCodewords = new Uint8Array(spec.dataCodewords);
    for (let i = 0; i < spec.dataCodewords; i += 1) {
      let val = 0;
      for (let b = 0; b < 8; b += 1) {
        val = (val << 1) | bits[i * 8 + b];
      }
      dataCodewords[i] = val;
    }

    const ec = rsEncode(dataCodewords, spec.ecCodewords);
    const finalBits = [];
    for (const cw of dataCodewords) {
      for (let b = 7; b >= 0; b -= 1) finalBits.push((cw >>> b) & 1);
    }
    for (const cw of ec) {
      for (let b = 7; b >= 0; b -= 1) finalBits.push((cw >>> b) & 1);
    }
    return { spec, finalBits };
  }

  function createEmptyMatrix(size) {
    const modules = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
    const reserved = Array.from({ length: size }, () => new Uint8Array(size));
    return { modules, reserved, size };
  }

  function setFunctionModule(mat, r, c, dark) {
    if (r < 0 || r >= mat.size || c < 0 || c >= mat.size) return;
    mat.modules[r][c] = dark ? 1 : 0;
    mat.reserved[r][c] = 1;
  }

  function drawFinder(mat, top, left) {
    for (let dr = -1; dr <= 7; dr += 1) {
      for (let dc = -1; dc <= 7; dc += 1) {
        const r = top + dr;
        const c = left + dc;
        if (r < 0 || r >= mat.size || c < 0 || c >= mat.size) continue;
        const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setFunctionModule(mat, r, c, inOuter && (onBorder || inCenter));
      }
    }
  }

  function drawAlignment(mat, centerR, centerC) {
    for (let dr = -2; dr <= 2; dr += 1) {
      for (let dc = -2; dc <= 2; dc += 1) {
        const dist = Math.max(Math.abs(dr), Math.abs(dc));
        setFunctionModule(mat, centerR + dr, centerC + dc, dist !== 1);
      }
    }
  }

  function formatBits(mask) {
    // ECC Level L = 01
    const data = (0b01 << 3) | mask;
    let rem = data << 10;
    const gen = 0b10100110111;
    for (let i = 14; i >= 10; i -= 1) {
      if ((rem >>> i) & 1) {
        rem ^= gen << (i - 10);
      }
    }
    return ((data << 10) | rem) ^ 0b101010000010010;
  }

  function applyFormat(mat, mask) {
    const bits = formatBits(mask);
    for (let i = 0; i <= 5; i += 1) setFunctionModule(mat, 8, i, ((bits >>> (14 - i)) & 1) === 1);
    setFunctionModule(mat, 8, 7, ((bits >>> 8) & 1) === 1);
    setFunctionModule(mat, 8, 8, ((bits >>> 7) & 1) === 1);
    setFunctionModule(mat, 7, 8, ((bits >>> 6) & 1) === 1);
    for (let i = 9; i <= 14; i += 1) setFunctionModule(mat, 14 - i, 8, ((bits >>> (14 - i)) & 1) === 1);

    for (let i = 0; i <= 7; i += 1) setFunctionModule(mat, 8, mat.size - 1 - i, ((bits >>> i) & 1) === 1);
    for (let i = 8; i <= 14; i += 1) setFunctionModule(mat, mat.size - 15 + i, 8, ((bits >>> i) & 1) === 1);
    setFunctionModule(mat, mat.size - 8, 8, true);
  }

  function maskBit(mask, r, c) {
    switch (mask) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
      case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
      case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
      default: return false;
    }
  }

  function penaltyScore(modules) {
    const n = modules.length;
    let penalty = 0;

    // Rule 1: 5+ consecutive same color in row/col
    for (let r = 0; r < n; r += 1) {
      let runLen = 1;
      for (let c = 1; c < n; c += 1) {
        if (modules[r][c] === modules[r][c - 1]) {
          runLen += 1;
          if (runLen === 5) penalty += 3;
          else if (runLen > 5) penalty += 1;
        } else {
          runLen = 1;
        }
      }
    }
    for (let c = 0; c < n; c += 1) {
      let runLen = 1;
      for (let r = 1; r < n; r += 1) {
        if (modules[r][c] === modules[r - 1][c]) {
          runLen += 1;
          if (runLen === 5) penalty += 3;
          else if (runLen > 5) penalty += 1;
        } else {
          runLen = 1;
        }
      }
    }

    // Rule 2: 2x2 blocks
    for (let r = 0; r < n - 1; r += 1) {
      for (let c = 0; c < n - 1; c += 1) {
        const v = modules[r][c];
        if (v === modules[r][c + 1] && v === modules[r + 1][c] && v === modules[r + 1][c + 1]) {
          penalty += 3;
        }
      }
    }

    // Rule 4: balance of dark modules
    let darkCount = 0;
    for (let r = 0; r < n; r += 1) {
      for (let c = 0; c < n; c += 1) {
        if (modules[r][c] === 1) darkCount += 1;
      }
    }
    const percent = (darkCount * 100) / (n * n);
    penalty += Math.floor(Math.abs(percent - 50) / 5) * 10;
    return penalty;
  }

  function buildQrMatrix(text) {
    const { spec, finalBits } = encodeDataBits(text);
    const mat = createEmptyMatrix(spec.size);

    drawFinder(mat, 0, 0);
    drawFinder(mat, 0, spec.size - 7);
    drawFinder(mat, spec.size - 7, 0);

    for (let i = 8; i < spec.size - 8; i += 1) {
      setFunctionModule(mat, 6, i, i % 2 === 0);
      setFunctionModule(mat, i, 6, i % 2 === 0);
    }

    for (const pos of spec.align) {
      drawAlignment(mat, pos, pos);
    }

    // Reserve format areas before placing data
    applyFormat(mat, 0);

    // Place data bits in zig-zag columns
    let bitIdx = 0;
    let upward = true;
    for (let rightCol = spec.size - 1; rightCol >= 1; rightCol -= 2) {
      if (rightCol === 6) rightCol -= 1;
      for (let step = 0; step < spec.size; step += 1) {
        const r = upward ? spec.size - 1 - step : step;
        for (let offset = 0; offset < 2; offset += 1) {
          const c = rightCol - offset;
          if (!mat.reserved[r][c]) {
            const bit = bitIdx < finalBits.length ? finalBits[bitIdx] : 0;
            bitIdx += 1;
            mat.modules[r][c] = bit;
          }
        }
      }
      upward = !upward;
    }

    // Choose lowest-penalty mask
    let bestMask = 0;
    let bestScore = Infinity;
    let bestModules = null;

    for (let mask = 0; mask < 8; mask += 1) {
      const candidate = createEmptyMatrix(spec.size);
      for (let r = 0; r < spec.size; r += 1) {
        for (let c = 0; c < spec.size; c += 1) {
          candidate.reserved[r][c] = mat.reserved[r][c];
          candidate.modules[r][c] = mat.reserved[r][c]
            ? mat.modules[r][c]
            : mat.modules[r][c] ^ (maskBit(mask, r, c) ? 1 : 0);
        }
      }
      applyFormat(candidate, mask);
      const score = penaltyScore(candidate.modules);
      if (score < bestScore) {
        bestScore = score;
        bestMask = mask;
        bestModules = candidate.modules;
      }
    }

    return bestModules;
  }

  function generateQrSvg(text, sizePx = 220) {
    const matrix = buildQrMatrix(text);
    const n = matrix.length;
    const quiet = 4;
    const viewSize = n + quiet * 2;
    let pathD = '';
    for (let r = 0; r < n; r += 1) {
      for (let c = 0; c < n; c += 1) {
        if (matrix[r][c] === 1) {
          pathD += `M${c + quiet},${r + quiet}h1v1h-1z`;
        }
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" width="${sizePx}" height="${sizePx}" shape-rendering="crispEdges" role="img" aria-label="QR code for ${text.replace(/"/g, '')}"><rect width="100%" height="100%" fill="#ffffff"/><path d="${pathD}" fill="#0f172a"/></svg>`;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildQrMatrix, generateQrSvg };
  } else {
    globalScope.QuickLunchQR = { buildQrMatrix, generateQrSvg };
  }
})(typeof window !== 'undefined' ? window : globalThis);
