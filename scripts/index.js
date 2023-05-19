import m from 'mithril';
import AppComponent from './components/app.js';
import '../styles/index.scss';

m.route(document.querySelector('main'), '/', {
  '/': AppComponent
});
