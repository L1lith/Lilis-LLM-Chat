export default function getWindow() {
  try {
    return window;
  } catch (err) {
    return null;
  }
}
