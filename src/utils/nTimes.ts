export default function nTimes(times: number, fn: (i: number) => void) {
  if (times < 1) {
    return;
  }

  new Array(times).fill(0).forEach((_, i) => fn(i));
}
