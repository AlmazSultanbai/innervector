import { Domain, StrengthMeta } from './types';

export const STRENGTHS: StrengthMeta[] = [
  { name: 'Achiever', domain: 'Executing' },
  { name: 'Arranger', domain: 'Executing' },
  { name: 'Belief', domain: 'Executing' },
  { name: 'Consistency', domain: 'Executing' },
  { name: 'Deliberative', domain: 'Executing' },
  { name: 'Discipline', domain: 'Executing' },
  { name: 'Focus', domain: 'Executing' },
  { name: 'Responsibility', domain: 'Executing' },
  { name: 'Restorative', domain: 'Executing' },
  { name: 'Activator', domain: 'Influencing' },
  { name: 'Command', domain: 'Influencing' },
  { name: 'Communication', domain: 'Influencing' },
  { name: 'Competition', domain: 'Influencing' },
  { name: 'Maximizer', domain: 'Influencing' },
  { name: 'Self-Assurance', domain: 'Influencing' },
  { name: 'Significance', domain: 'Influencing' },
  { name: 'Woo', domain: 'Influencing' },
  { name: 'Adaptability', domain: 'Relationship Building' },
  { name: 'Connectedness', domain: 'Relationship Building' },
  { name: 'Developer', domain: 'Relationship Building' },
  { name: 'Empathy', domain: 'Relationship Building' },
  { name: 'Harmony', domain: 'Relationship Building' },
  { name: 'Includer', domain: 'Relationship Building' },
  { name: 'Individualization', domain: 'Relationship Building' },
  { name: 'Positivity', domain: 'Relationship Building' },
  { name: 'Relator', domain: 'Relationship Building' },
  { name: 'Analytical', domain: 'Strategic Thinking' },
  { name: 'Context', domain: 'Strategic Thinking' },
  { name: 'Futuristic', domain: 'Strategic Thinking' },
  { name: 'Ideation', domain: 'Strategic Thinking' },
  { name: 'Input', domain: 'Strategic Thinking' },
  { name: 'Intellection', domain: 'Strategic Thinking' },
  { name: 'Learner', domain: 'Strategic Thinking' },
  { name: 'Strategic', domain: 'Strategic Thinking' },
];

export const STRENGTH_NAMES = STRENGTHS.map((s) => s.name).sort();

export const STRENGTH_NAME_I18N: Record<string, { ru: string; ky: string }> = {
  'Achiever':         { ru: 'Достижение',           ky: 'Жетишкендик' },
  'Activator':        { ru: 'Катализатор',           ky: 'Катализатор' },
  'Adaptability':     { ru: 'Приспособляемость',     ky: 'Ийкемдүүлүк' },
  'Analytical':       { ru: 'Аналитик',              ky: 'Аналитик' },
  'Arranger':         { ru: 'Организатор',            ky: 'Уюштуруучу' },
  'Belief':           { ru: 'Убеждение',              ky: 'Ишенимдер' },
  'Command':          { ru: 'Распорядитель',          ky: 'Командалык' },
  'Communication':    { ru: 'Коммуникация',           ky: 'Коммуникация' },
  'Competition':      { ru: 'Конкуренция',            ky: 'Атаандашуу' },
  'Connectedness':    { ru: 'Взаимосвязанность',      ky: 'Байланыштуулук' },
  'Consistency':      { ru: 'Последовательность',     ky: 'Ырааттуулук' },
  'Context':          { ru: 'Контекст',               ky: 'Контекст' },
  'Deliberative':     { ru: 'Осмотрительность',       ky: 'Этияттык' },
  'Developer':        { ru: 'Развитие',               ky: 'Өнүктүрүүчү' },
  'Discipline':       { ru: 'Дисциплинированность',   ky: 'Тартип' },
  'Empathy':          { ru: 'Эмпатия',                ky: 'Эмпатия' },
  'Focus':            { ru: 'Сосредоточенность',      ky: 'Фокус' },
  'Futuristic':       { ru: 'Будущее',                ky: 'Келечекчил' },
  'Harmony':          { ru: 'Гармония',               ky: 'Гармония' },
  'Ideation':         { ru: 'Генератор идей',         ky: 'Идея жаратуу' },
  'Includer':         { ru: 'Включенность',           ky: 'Кошумчалоочу' },
  'Individualization':{ ru: 'Индивидуализация',       ky: 'Жеке мүнөздөмө' },
  'Input':            { ru: 'Вклад',                  ky: 'Топтоо' },
  'Intellection':     { ru: 'Мышление',               ky: 'Ой жүгүртүү' },
  'Learner':          { ru: 'Ученик',                 ky: 'Үйрөнүүчү' },
  'Maximizer':        { ru: 'Максимизатор',           ky: 'Максималдаштыруу' },
  'Positivity':       { ru: 'Позитивность',           ky: 'Позитивдүүлүк' },
  'Relator':          { ru: 'Отношения',              ky: 'Мамиле' },
  'Responsibility':   { ru: 'Ответственность',        ky: 'Жоопкерчилик' },
  'Restorative':      { ru: 'Восстановление',         ky: 'Калыбына келтирүү' },
  'Self-Assurance':   { ru: 'Уверенность',            ky: 'Өзүнө ишенүү' },
  'Significance':     { ru: 'Значимость',             ky: 'Маанилүүлүк' },
  'Strategic':        { ru: 'Стратегия',              ky: 'Стратегиялык ой' },
  'Woo':              { ru: 'Обаяние',                ky: 'Жагымдуулук' },
};

export const DOMAIN_COLORS: Record<Domain, { bg: string; text: string; border: string; glow: string }> = {
  Executing: {
    bg: 'bg-blue-950/60',
    text: 'text-blue-300',
    border: 'border-blue-500/40',
    glow: 'shadow-blue-500/20',
  },
  Influencing: {
    bg: 'bg-orange-950/60',
    text: 'text-orange-300',
    border: 'border-orange-500/40',
    glow: 'shadow-orange-500/20',
  },
  'Relationship Building': {
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
    glow: 'shadow-emerald-500/20',
  },
  'Strategic Thinking': {
    bg: 'bg-purple-950/60',
    text: 'text-purple-300',
    border: 'border-purple-500/40',
    glow: 'shadow-purple-500/20',
  },
};

export const DOMAIN_BADGE_COLORS: Record<Domain, string> = {
  Executing: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  Influencing: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  'Relationship Building': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  'Strategic Thinking': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
};

export function getDomainForStrength(name: string): Domain | null {
  const found = STRENGTHS.find((s) => s.name === name);
  return found ? found.domain : null;
}
