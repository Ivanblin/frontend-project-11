export default class View {
  constructor() {
    this.form = document.querySelector('.rss-form');
    this.input = document.getElementById('url-input');
    this.feedback = document.querySelector('.feedback');
  }

  init() {
    this.input.focus();
  }

  showError(message) {
    this.input.classList.add('is-invalid');
    this.feedback.textContent = message;
  }

  clearForm() {
    this.input.value = '';
    this.input.classList.remove('is-invalid');
    this.feedback.textContent = '';
    this.input.focus();
  }
}