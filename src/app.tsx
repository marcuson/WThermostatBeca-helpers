import globalCss from './style.css';
import { stylesheet } from './style.module.css';
import { addButtons } from './schedule/schedule';

// import CSS
document.head.append(VM.m(<style>{globalCss}</style>));
document.head.append(VM.m(<style>{stylesheet}</style>));

// init app
addButtons();
