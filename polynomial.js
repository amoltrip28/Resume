const fs = require("fs");

// Fraction class to handle rational numbers
class Fraction {
    constructor(num = 0n, den = 1n) {
        if (den === 0n) throw new Error("Denominator cannot be zero");
        const g = gcd(num, den);
        num /= g;
        den /= g;
        if (den < 0n) { num = -num; den = -den; }
        this.num = num;
        this.den = den;
    }

    add(other) {
        return new Fraction(
            this.num * other.den + other.num * this.den,
            this.den * other.den
        );
    }

    mul(other) {
        return new Fraction(
            this.num * other.num,
            this.den * other.den
        );
    }
}

// GCD for BigInt
function gcd(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b !== 0n) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

// Convert a character to its digit value
function digitVal(c) {
    if (c >= '0' && c <= '9') return BigInt(c.charCodeAt(0) - '0'.charCodeAt(0));
    if (c >= 'a' && c <= 'z') return 10n + BigInt(c.charCodeAt(0) - 'a'.charCodeAt(0));
    if (c >= 'A' && c <= 'Z') return 10n + BigInt(c.charCodeAt(0) - 'A'.charCodeAt(0));
    throw new Error(Invalid digit: ${c});
}

// Convert string in base base to BigInt
function fromBase(s, base) {
    let val = 0n;
    for (const c of s) {
        let d = digitVal(c);
        if (d >= BigInt(base)) throw new Error(Digit out of range in ${s});
        val = val * BigInt(base) + d;
    }
    return val;
}

// Lagrange interpolation to compute P(0)
function lagrangeP0(points, k) {
    let P0 = new Fraction(0n, 1n);
    for (let i = 0; i < k; i++) {
        let xi = BigInt(points[i][0]);
        let yi = BigInt(points[i][1]);
        let term = new Fraction(yi, 1n);

        for (let j = 0; j < k; j++) if (i !== j) {
            let xj = BigInt(points[j][0]);
            term = term.mul(new Fraction(-xj, xi - xj));
        }
        P0 = P0.add(term);
    }
    return P0;
}

// Main
if (process.argv.length < 3) {
    console.error("Usage: node amol.js <input.json>");
    process.exit(1);
}

const file = process.argv[2];
let rawData = fs.readFileSync(file, "utf8");
let data = JSON.parse(rawData);

let n = data.keys.n;
let k = data.keys.k;
let entries = [];

for (const [key, obj] of Object.entries(data)) {
    if (key === "keys") continue;
    let x = parseInt(key);
    let base = obj.base;
    let value = obj.value;
    let y = fromBase(value, base);
    entries.push([x, y]);
}

// Sort by x
entries.sort((a, b) => a[0] - b[0]);

let secret = lagrangeP0(entries, k);

process.stdout.write("Secret C = ");
if (secret.den === 1n) {
    console.log(secret.num.toString());
} else {
    console.log(${secret.num}/${secret.den});
}