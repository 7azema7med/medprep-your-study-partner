
-- Add additional tables for exam features

-- Question highlights
CREATE TABLE IF NOT EXISTS public.question_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id uuid REFERENCES public.tests(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  target_type text NOT NULL DEFAULT 'stem',
  target_id uuid,
  selected_text text NOT NULL,
  start_offset integer,
  end_offset integer,
  color text DEFAULT 'yellow',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.question_highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own highlights" ON public.question_highlights FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Question strikeouts
CREATE TABLE IF NOT EXISTS public.question_strikeouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id uuid REFERENCES public.tests(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  choice_id uuid NOT NULL REFERENCES public.answer_choices(id) ON DELETE CASCADE,
  is_struck boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.question_strikeouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own strikeouts" ON public.question_strikeouts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Question feedback
CREATE TABLE IF NOT EXISTS public.question_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id uuid REFERENCES public.tests(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  issue_type text NOT NULL DEFAULT 'content_error',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.question_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own feedback" ON public.question_feedback FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Flashcards
CREATE TABLE IF NOT EXISTS public.flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own flashcards" ON public.flashcards FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Seed 10 medical questions with answer choices
INSERT INTO public.questions (id, question_text, explanation, difficulty, subject_id) VALUES
('a0000001-0000-0000-0000-000000000001', 'A 37-year-old man is found unresponsive next to a tree during a thunderstorm. He is not breathing when paramedics arrive. On examination, the pupils are fixed and dilated. Several erythematous marks in a fern-like pattern are seen on the skin of his lower extremities. Partial-thickness burns are present on both arms. Cardiopulmonary resuscitation is started; there is no return of spontaneous circulation, and the patient is pronounced dead shortly after arrival at the hospital. Which of the following is the most likely primary cause of death?', 'Lightning strike causes death most commonly through cardiac arrhythmia. The massive electrical discharge can cause immediate cardiac arrest (asystole or ventricular fibrillation). The fern-like marks (Lichtenberg figures) are pathognomonic for lightning strikes.', 'medium', NULL),
('a0000001-0000-0000-0000-000000000002', 'A 45-year-old man presents to the emergency department with acute onset chest pain radiating to his left arm. ECG shows ST-segment elevation in leads II, III, and aVF. Which of the following coronary arteries is most likely occluded?', 'ST-segment elevation in leads II, III, and aVF indicates an inferior myocardial infarction, most commonly caused by occlusion of the right coronary artery (RCA).', 'medium', NULL),
('a0000001-0000-0000-0000-000000000003', 'A 28-year-old woman presents with fatigue, weight gain, constipation, and cold intolerance for the past 3 months. Physical examination reveals dry skin and delayed relaxation of deep tendon reflexes. Laboratory studies show elevated TSH and low free T4. Which of the following is the most likely diagnosis?', 'Hashimoto thyroiditis is the most common cause of primary hypothyroidism in iodine-sufficient areas.', 'easy', NULL),
('a0000001-0000-0000-0000-000000000004', 'A 55-year-old diabetic man presents with painless, progressive loss of vision in his right eye. Fundoscopic examination reveals cotton-wool spots, flame hemorrhages, and neovascularization. What is the most likely diagnosis?', 'Neovascularization with cotton-wool spots and hemorrhages in a diabetic patient indicates proliferative diabetic retinopathy.', 'medium', NULL),
('a0000001-0000-0000-0000-000000000005', 'A 22-year-old college student presents with fever, pharyngitis, lymphadenopathy, and splenomegaly. A peripheral blood smear shows atypical lymphocytes. Which virus is most likely responsible?', 'The classic triad of fever, pharyngitis, and lymphadenopathy with atypical lymphocytes is characteristic of EBV infectious mononucleosis.', 'easy', NULL),
('a0000001-0000-0000-0000-000000000006', 'A 60-year-old woman with a history of rheumatic heart disease presents with an irregularly irregular pulse. Her ECG confirms atrial fibrillation. What is the most feared complication requiring anticoagulation?', 'Atrial fibrillation leads to blood stasis in the left atrium, forming thrombi that can embolize systemically.', 'medium', NULL),
('a0000001-0000-0000-0000-000000000007', 'A 35-year-old man presents with episodic headache, diaphoresis, and palpitations. His blood pressure is 220/130 mmHg. A 24-hour urine collection shows elevated catecholamines and metanephrines. What is the most likely tumor?', 'The classic triad of headache, diaphoresis, and palpitations with hypertension and elevated catecholamines is diagnostic of pheochromocytoma.', 'hard', NULL),
('a0000001-0000-0000-0000-000000000008', 'A 50-year-old woman develops sudden onset severe headache described as the worst headache of my life. CT of the head without contrast is normal. What is the most appropriate next step?', 'A thunderclap headache raises concern for subarachnoid hemorrhage. If CT is negative, lumbar puncture is the next step to look for xanthochromia.', 'hard', NULL),
('a0000001-0000-0000-0000-000000000009', 'A 40-year-old woman presents with bilateral hand joint stiffness worse in the morning lasting over 1 hour. She has symmetric swelling of the PIP and MCP joints. Rheumatoid factor is positive. What is the most likely diagnosis?', 'Symmetric inflammatory polyarthritis affecting PIP and MCP joints with prolonged morning stiffness and positive RF is classic for rheumatoid arthritis.', 'easy', NULL),
('a0000001-0000-0000-0000-000000000010', 'A 25-year-old woman presents with a butterfly-shaped rash across her cheeks and nose, joint pain, and proteinuria. ANA is positive at 1:640. What antibody is most specific for this condition?', 'Anti-dsDNA antibodies are highly specific for systemic lupus erythematosus (SLE) and correlate with disease activity.', 'medium', NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed answer choices
INSERT INTO public.answer_choices (question_id, choice_letter, choice_text, is_correct, explanation) VALUES
-- Q1: Lightning
('a0000001-0000-0000-0000-000000000001', 'A', 'Carbon monoxide poisoning', false, 'CO poisoning is associated with fires in enclosed spaces.'),
('a0000001-0000-0000-0000-000000000001', 'B', 'Cardiac arrhythmia', true, 'Lightning causes massive electrical discharge inducing ventricular fibrillation or asystole.'),
('a0000001-0000-0000-0000-000000000001', 'C', 'Extensive deep tissue burns', false, 'Lightning typically causes superficial burns.'),
('a0000001-0000-0000-0000-000000000001', 'D', 'Intracranial hemorrhage', false, 'Not the primary mechanism of death in lightning strikes.'),
('a0000001-0000-0000-0000-000000000001', 'E', 'Pulmonary barotrauma', false, 'Barotrauma is associated with blast injuries.'),
('a0000001-0000-0000-0000-000000000001', 'F', 'Upper airway edema', false, 'Airway edema is seen with thermal inhalation injuries.'),
-- Q2: Inferior MI
('a0000001-0000-0000-0000-000000000002', 'A', 'Left anterior descending artery', false, 'LAD supplies the anterior wall; occlusion causes ST elevation in V1-V4.'),
('a0000001-0000-0000-0000-000000000002', 'B', 'Left circumflex artery', false, 'LCx supplies the lateral wall.'),
('a0000001-0000-0000-0000-000000000002', 'C', 'Right coronary artery', true, 'The RCA supplies the inferior wall of the heart.'),
('a0000001-0000-0000-0000-000000000002', 'D', 'Left main coronary artery', false, 'Left main occlusion causes widespread ST changes.'),
('a0000001-0000-0000-0000-000000000002', 'E', 'Posterior descending artery', false, 'The PDA is usually a branch of the RCA.'),
-- Q3: Hypothyroidism
('a0000001-0000-0000-0000-000000000003', 'A', 'Graves disease', false, 'Graves causes hyperthyroidism.'),
('a0000001-0000-0000-0000-000000000003', 'B', 'Hashimoto thyroiditis', true, 'Most common cause of primary hypothyroidism.'),
('a0000001-0000-0000-0000-000000000003', 'C', 'Subacute thyroiditis', false, 'Presents with neck pain and transient thyrotoxicosis.'),
('a0000001-0000-0000-0000-000000000003', 'D', 'Thyroid carcinoma', false, 'Typically presents as a thyroid nodule.'),
('a0000001-0000-0000-0000-000000000003', 'E', 'Toxic multinodular goiter', false, 'Causes hyperthyroidism.'),
-- Q4: Diabetic retinopathy
('a0000001-0000-0000-0000-000000000004', 'A', 'Central retinal artery occlusion', false, 'Presents with sudden painless vision loss and cherry-red spot.'),
('a0000001-0000-0000-0000-000000000004', 'B', 'Central retinal vein occlusion', false, 'Presents with diffuse hemorrhages in a blood and thunder pattern.'),
('a0000001-0000-0000-0000-000000000004', 'C', 'Proliferative diabetic retinopathy', true, 'Neovascularization is the hallmark of proliferative diabetic retinopathy.'),
('a0000001-0000-0000-0000-000000000004', 'D', 'Age-related macular degeneration', false, 'Typically seen in older patients with drusen.'),
('a0000001-0000-0000-0000-000000000004', 'E', 'Hypertensive retinopathy', false, 'Shows AV nicking and copper/silver wiring.'),
-- Q5: Mono
('a0000001-0000-0000-0000-000000000005', 'A', 'Cytomegalovirus', false, 'CMV mono is typically heterophile-negative.'),
('a0000001-0000-0000-0000-000000000005', 'B', 'Epstein-Barr virus', true, 'Classic cause of infectious mononucleosis.'),
('a0000001-0000-0000-0000-000000000005', 'C', 'Human herpesvirus 6', false, 'Causes roseola in children.'),
('a0000001-0000-0000-0000-000000000005', 'D', 'Adenovirus', false, 'Causes pharyngoconjunctival fever.'),
('a0000001-0000-0000-0000-000000000005', 'E', 'Parvovirus B19', false, 'Causes erythema infectiosum (fifth disease).'),
-- Q6: Afib
('a0000001-0000-0000-0000-000000000006', 'A', 'Heart failure', false, 'Heart failure can result but is not the most feared complication.'),
('a0000001-0000-0000-0000-000000000006', 'B', 'Systemic thromboembolism', true, 'Blood stasis in the left atrium forms thrombi that can embolize.'),
('a0000001-0000-0000-0000-000000000006', 'C', 'Ventricular tachycardia', false, 'Not directly caused by atrial fibrillation.'),
('a0000001-0000-0000-0000-000000000006', 'D', 'Pericardial effusion', false, 'Not a typical complication of atrial fibrillation.'),
('a0000001-0000-0000-0000-000000000006', 'E', 'Endocarditis', false, 'Not related to atrial fibrillation.'),
-- Q7: Pheochromocytoma
('a0000001-0000-0000-0000-000000000007', 'A', 'Adrenal adenoma', false, 'Usually causes Cushing or Conn syndrome.'),
('a0000001-0000-0000-0000-000000000007', 'B', 'Pheochromocytoma', true, 'Classic triad with elevated catecholamines.'),
('a0000001-0000-0000-0000-000000000007', 'C', 'Neuroblastoma', false, 'Typically seen in children.'),
('a0000001-0000-0000-0000-000000000007', 'D', 'Paraganglioma', false, 'Extra-adrenal tumor, less common.'),
('a0000001-0000-0000-0000-000000000007', 'E', 'Carcinoid tumor', false, 'Produces serotonin, not catecholamines.'),
-- Q8: SAH
('a0000001-0000-0000-0000-000000000008', 'A', 'MRI of the brain', false, 'Not the immediate next step after negative CT for SAH.'),
('a0000001-0000-0000-0000-000000000008', 'B', 'Lumbar puncture', true, 'LP to look for xanthochromia when CT is negative.'),
('a0000001-0000-0000-0000-000000000008', 'C', 'CT angiography', false, 'May be done after LP confirms SAH.'),
('a0000001-0000-0000-0000-000000000008', 'D', 'Repeat CT in 24 hours', false, 'Delays diagnosis inappropriately.'),
('a0000001-0000-0000-0000-000000000008', 'E', 'Observation and analgesics', false, 'Misses potential life-threatening diagnosis.'),
-- Q9: RA
('a0000001-0000-0000-0000-000000000009', 'A', 'Osteoarthritis', false, 'OA affects DIP joints and has short morning stiffness.'),
('a0000001-0000-0000-0000-000000000009', 'B', 'Rheumatoid arthritis', true, 'Symmetric PIP/MCP involvement with prolonged morning stiffness.'),
('a0000001-0000-0000-0000-000000000009', 'C', 'Psoriatic arthritis', false, 'Often asymmetric with skin involvement.'),
('a0000001-0000-0000-0000-000000000009', 'D', 'Gout', false, 'Typically monoarticular with acute onset.'),
('a0000001-0000-0000-0000-000000000009', 'E', 'Systemic lupus erythematosus', false, 'Arthritis in SLE is usually non-erosive.'),
-- Q10: SLE
('a0000001-0000-0000-0000-000000000010', 'A', 'Anti-histone', false, 'Associated with drug-induced lupus.'),
('a0000001-0000-0000-0000-000000000010', 'B', 'Anti-dsDNA', true, 'Highly specific for SLE and correlates with disease activity.'),
('a0000001-0000-0000-0000-000000000010', 'C', 'Anti-centromere', false, 'Associated with limited scleroderma (CREST).'),
('a0000001-0000-0000-0000-000000000010', 'D', 'Anti-Scl-70', false, 'Associated with diffuse scleroderma.'),
('a0000001-0000-0000-0000-000000000010', 'E', 'Anti-Jo-1', false, 'Associated with polymyositis/dermatomyositis.');
