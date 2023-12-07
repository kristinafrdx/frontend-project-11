import * as yup from 'yup';
import render from './view.js';
import onChange from 'on-change';

export const schema = yup.object().shape({
  url: yup.string().trim().url()
})

export default app = () => {
  const elements = {
    form: document.querySelector('form'),
    buttonSubmit: document.querySelector('button[type="submit"]'),
    input: document.querySelector('#url-input'),
  }
  
  const initialState = {
    form: {
      field: '',
      status: 'filling',
      valid: true,
      errors: []
    }
  }

  const state = onChange(initialState, render(elements, initialState));
  elements.input.addEventListener('input', (e) => {
    const { value } = e.target;
    state.form.field = value;

  })

  elements.form.addEventListener('submit', (e) => {
    state.form.status = 'sending';

    try {
      const data = {
        field: state.form.field
      }
     // отправить данные на сервер
     // поменять статус формы 
     // state.form.status = 'sent'
    }
    catch (error) {
    // обработка ошибок при отправке 
    }
  })
}

