import onChange from 'on-change';

const buildStateWatcher = (state) => {
  const stateWatcher = onChange(state, (path, value) => {
    console.log('path stateWatcher: ', path);
    console.log('value: ', value);
    const urlInput = document.querySelector('[name="url"]');
    const statusBlock = document.getElementById('status');
    const submitButton = document.getElementById('add-rss');
    const channelsContainer = document.getElementById('channels');

    console.log('buildStateWatcher', state);

    if (path === 'form.state') {
      console.log('path', path);

      switch (value) {
        case 'filling': {
          break;
        }

        case 'invalid': {
          urlInput.classList.add('border', 'border-danger');
          statusBlock.classList.add('text-danger');
          console.log('urlInput: ', urlInput);
          statusBlock.innerHTML = state.form.errorsMessages;
          break;
        }

        case 'valid': {
          console.log('ВАЛИДНО');
          statusBlock.classList.remove('text-danger');
          urlInput.classList.remove('border', 'border-danger');
          console.log('urlInput: ', urlInput.classList);
          urlInput.value = '';
          break;
        }
      }
    }
  })
  return stateWatcher;
}

export default buildStateWatcher;