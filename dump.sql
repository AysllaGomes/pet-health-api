--
-- PostgreSQL database dump
--

\restrict NVutgpvhsBDMmmYI2ESqJrLlhZdP2QTDWPpDLMtdTGZBJAEbG9lp93b6wxfW592

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: VaccineCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VaccineCategory" AS ENUM (
    'VACCINE',
    'ANTIPARASITIC',
    'DEWORMER'
);


ALTER TYPE public."VaccineCategory" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Appointment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Appointment" (
    id text NOT NULL,
    "petId" text NOT NULL,
    title text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    veterinarian text,
    clinic text,
    notes text,
    "reminderDaysBefore" integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Appointment" OWNER TO postgres;

--
-- Name: Medication; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Medication" (
    id text NOT NULL,
    "petId" text NOT NULL,
    name text NOT NULL,
    dosage text NOT NULL,
    frequency text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    "time" text,
    notes text,
    "reminderMinutesBefore" integer DEFAULT 60 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Medication" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "petId" text NOT NULL,
    type text NOT NULL,
    "referenceId" text NOT NULL,
    "emailTo" text NOT NULL,
    "scheduledFor" timestamp(3) without time zone NOT NULL,
    "sentAt" timestamp(3) without time zone,
    status text NOT NULL,
    message text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Pet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Pet" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    species text NOT NULL,
    breed text,
    "birthDate" timestamp(3) without time zone,
    weight double precision,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Pet" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: Vaccine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Vaccine" (
    id text NOT NULL,
    "petId" text NOT NULL,
    name text NOT NULL,
    "applicationDate" timestamp(3) without time zone NOT NULL,
    "nextDoseDate" timestamp(3) without time zone,
    veterinarian text,
    clinic text,
    notes text,
    "reminderDaysBefore" integer DEFAULT 7 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    category public."VaccineCategory" DEFAULT 'VACCINE'::public."VaccineCategory" NOT NULL
);


ALTER TABLE public."Vaccine" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Appointment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Appointment" (id, "petId", title, date, veterinarian, clinic, notes, "reminderDaysBefore", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Medication; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Medication" (id, "petId", name, dosage, frequency, "startDate", "endDate", "time", notes, "reminderMinutesBefore", "createdAt", "updatedAt") FROM stdin;
1816e271-4dce-4ad5-b83c-86023b376f1f	541353b5-e072-4ef4-aa94-9659fffd415e	Remédio para ansiedade	1/2 comprimido	2x ao dia	2026-04-15 00:00:00	2026-12-31 00:00:00	08:00	\N	5	2026-04-15 23:16:33.932	2026-04-15 23:16:33.932
e3b91a96-13b2-4141-996c-b595d4734b05	541353b5-e072-4ef4-aa94-9659fffd415e	Remédio para ansiedade	1/2 comprimido	2x ao dia	2026-04-15 00:00:00	2026-12-31 00:00:00	20:00	\N	5	2026-04-15 23:16:46.082	2026-04-15 23:16:46.082
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "petId", type, "referenceId", "emailTo", "scheduledFor", "sentAt", status, message, "createdAt", "updatedAt") FROM stdin;
e39cc508-92f8-42ba-8961-f2af8ad7106c	541353b5-e072-4ef4-aa94-9659fffd415e	MEDICATION	e3b91a96-13b2-4141-996c-b595d4734b05	ayslla.gomes@outlook.com	2026-04-17 19:55:00	2026-04-17 19:55:04.789	SENT	Lembrete enviado para Remédio para ansiedade	2026-04-17 19:55:04.898	2026-04-17 19:55:04.898
a7950ee9-cb2e-4b1e-8834-2b939f837ac7	541353b5-e072-4ef4-aa94-9659fffd415e	MEDICATION	1816e271-4dce-4ad5-b83c-86023b376f1f	ayslla.gomes@outlook.com	2026-04-24 07:55:00	2026-04-24 07:55:07.188	SENT	Lembrete enviado para Remédio para ansiedade	2026-04-24 07:55:07.78	2026-04-24 07:55:07.78
fb18e82e-d39a-43a2-971b-31e99f381879	541353b5-e072-4ef4-aa94-9659fffd415e	MEDICATION	e3b91a96-13b2-4141-996c-b595d4734b05	ayslla.gomes@outlook.com	2026-04-24 19:55:00	2026-04-24 19:55:57.064	SENT	Lembrete enviado para Remédio para ansiedade	2026-04-24 19:55:57.066	2026-04-24 19:55:57.066
\.


--
-- Data for Name: Pet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Pet" (id, "userId", name, species, breed, "birthDate", weight, notes, "createdAt", "updatedAt") FROM stdin;
3b6be0a9-c542-43fd-b6ae-49bbc3513f74	fb562378-5a2f-4099-8583-1c588537005e	Kiara	dog	Lhasa Apso	2020-08-25 00:00:00	12	\N	2026-04-15 22:58:50.486	2026-04-15 22:58:50.486
956de4a3-1732-44b4-82ed-9911cb955720	fb562378-5a2f-4099-8583-1c588537005e	Kalia	dog	Lhasa Apso	2023-11-20 00:00:00	14	\N	2026-04-15 22:59:21.919	2026-04-15 22:59:21.919
529081f4-e8ec-45f0-8726-502e76d8adaa	fb562378-5a2f-4099-8583-1c588537005e	Kaleb	dog	Lhasa Apso	2023-02-17 00:00:00	14	\N	2026-04-15 23:00:00.775	2026-04-15 23:00:00.775
c5c8e36f-584a-462d-a527-0492258079ae	fb562378-5a2f-4099-8583-1c588537005e	Theo	dog	Lhasa Apso	2024-01-05 00:00:00	4.8	\N	2026-04-15 23:00:49.238	2026-04-15 23:00:49.238
d6af84e2-3945-48e9-ab40-f7c7d2fb4bfc	fb562378-5a2f-4099-8583-1c588537005e	Kayla	dog	Shih Tzu	2026-01-01 00:00:00	1.79	\N	2026-04-15 23:01:30.031	2026-04-15 23:01:30.031
541353b5-e072-4ef4-aa94-9659fffd415e	fb562378-5a2f-4099-8583-1c588537005e	Romeu	dog	Yorkshire Terrier	2017-09-10 00:00:00	3.7	\N	2026-04-15 23:02:14.334	2026-04-15 23:02:14.334
caadc8df-d8d1-41af-862b-305395e6c08d	fb562378-5a2f-4099-8583-1c588537005e	Molly	cat	Sem Raça Definida (Vira Lata)	2024-08-30 00:00:00	5	\N	2026-04-15 23:03:15.263	2026-04-15 23:03:15.263
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, password, "createdAt", "updatedAt") FROM stdin;
fb562378-5a2f-4099-8583-1c588537005e	Ayslla Caroline	ayslla.gomes@outlook.com	$2b$10$XYYjCG.zULov4izv0mDXUON2mMDC.0WhgOAtWlu9YkO0IPAc4QJuS	2026-04-15 22:53:23.734	2026-04-15 22:53:23.734
51f6d55e-0cd5-4b2a-938b-26c298ac1b1a	Maria Fernanda	mfb171201@gmail.com	$2b$10$wqmhIrVuPjD9d0N7Mfy2aOhY1Qg/fg.pE/Y8hLBLkOCVBgoUFHw8K	2026-04-15 23:19:47.909	2026-04-15 23:19:47.909
\.


--
-- Data for Name: Vaccine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Vaccine" (id, "petId", name, "applicationDate", "nextDoseDate", veterinarian, clinic, notes, "reminderDaysBefore", "createdAt", "updatedAt", category) FROM stdin;
27e270f4-2316-4c4e-8a29-97cd9832afa4	3b6be0a9-c542-43fd-b6ae-49bbc3513f74	Antipulgas	2026-03-15 00:00:00	2026-06-15 00:00:00	\N	\N	Bravecto	5	2026-04-15 23:06:45.85	2026-04-15 23:06:45.85	ANTIPARASITIC
a6b98b20-5bbe-4f92-aaf5-6d20dc996b58	956de4a3-1732-44b4-82ed-9911cb955720	Antipulgas	2026-03-15 00:00:00	2026-06-15 00:00:00	\N	\N	Bravecto	5	2026-04-15 23:07:03.782	2026-04-15 23:07:03.782	ANTIPARASITIC
7afa7fbd-b35b-466b-b2b7-1054819aa44d	529081f4-e8ec-45f0-8726-502e76d8adaa	Antipulgas	2026-03-15 00:00:00	2026-06-15 00:00:00	\N	\N	Bravecto	5	2026-04-15 23:07:22.386	2026-04-15 23:07:22.386	ANTIPARASITIC
f6526863-936d-4313-9922-9326f4a32246	c5c8e36f-584a-462d-a527-0492258079ae	Antipulgas	2026-03-15 00:00:00	2026-06-15 00:00:00	\N	\N	Bravecto	5	2026-04-15 23:07:43.528	2026-04-15 23:07:43.528	ANTIPARASITIC
1629478d-cd69-4988-8da8-9bb22cb35a60	541353b5-e072-4ef4-aa94-9659fffd415e	Antipulgas	2026-03-15 00:00:00	2026-06-15 00:00:00	\N	\N	Bravecto	5	2026-04-15 23:08:15.817	2026-04-15 23:08:15.817	ANTIPARASITIC
90ad8d24-710c-40bb-a8cb-742c50035878	caadc8df-d8d1-41af-862b-305395e6c08d	Antipulgas	2026-03-15 00:00:00	2026-06-15 00:00:00	\N	\N	Bravecto	5	2026-04-15 23:08:33.259	2026-04-15 23:08:33.259	ANTIPARASITIC
5aeeee5e-62a4-4071-801f-09ae06365785	541353b5-e072-4ef4-aa94-9659fffd415e	Vacinas Anuais (Raiva, Polivalente e Gripe)	2026-04-09 00:00:00	2027-04-09 00:00:00	\N	\N	Raiva, Polivalente e Gripe	5	2026-04-15 23:13:20.811	2026-04-15 23:13:20.811	VACCINE
3d7f2b4d-ecf3-4ac2-b531-ab5d7c955b8b	c5c8e36f-584a-462d-a527-0492258079ae	Vacina Polivalente	2026-01-22 00:00:00	2027-02-10 00:00:00	Dra. Adriana	Clinica San Clá	\N	7	2026-05-03 15:30:37.374	2026-05-03 15:30:37.374	VACCINE
30bb0477-2d4b-4130-9a00-97057f66daf8	c5c8e36f-584a-462d-a527-0492258079ae	Vacina Polivalente	2026-04-01 00:00:00	2026-04-22 00:00:00	Dra. Calebe Castro	Clinica Lilla's	\N	7	2026-05-03 15:32:42.173	2026-05-03 15:32:42.173	VACCINE
a4cf0c76-99ea-495f-ba90-2d65f29a4212	c5c8e36f-584a-462d-a527-0492258079ae	Vacina Polivalente	2026-04-23 00:00:00	2027-04-23 00:00:00	Dra. Isabella Mendeiros	Clinica Lilla's	\N	7	2026-05-03 15:33:23.604	2026-05-03 15:33:23.604	VACCINE
b25742b6-13b7-4be0-84c9-c4341ba0dc02	c5c8e36f-584a-462d-a527-0492258079ae	Vacina de Raiva	2026-04-23 00:00:00	2027-04-23 00:00:00	Dra. Isabella Mendeiros	Clinica Lilla's	\N	7	2026-05-03 15:33:32.609	2026-05-03 15:33:32.609	VACCINE
6bf98218-293a-4992-bb31-33b71b57c748	541353b5-e072-4ef4-aa94-9659fffd415e	Vermífugo	2026-03-04 00:00:00	2026-04-07 00:00:00	\N	\N	\N	7	2026-05-03 15:38:12.803	2026-05-03 15:38:12.803	DEWORMER
fa074069-606f-464c-8397-f90480c94a6f	c5c8e36f-584a-462d-a527-0492258079ae	Vermífugo	2026-01-22 00:00:00	2026-02-06 00:00:00	\N	\N	\N	7	2026-05-03 15:40:21.803	2026-05-03 15:40:21.803	DEWORMER
f0a92161-1f3a-47c6-a42a-cad93208df33	c5c8e36f-584a-462d-a527-0492258079ae	Vermífugo	2026-03-06 00:00:00	2026-07-06 00:00:00	\N	\N	\N	7	2026-05-03 15:40:52.505	2026-05-03 15:40:52.505	DEWORMER
ee741f3a-f7f1-48c6-a6c8-f527c69acae8	d6af84e2-3945-48e9-ab40-f7c7d2fb4bfc	Vacina Polivalente	2026-02-25 00:00:00	2026-03-18 00:00:00	\N	\N	\N	7	2026-05-03 15:42:39.906	2026-05-03 15:42:39.906	VACCINE
59a6b5b2-ebe3-4c97-af1d-e5fd0d539c5d	d6af84e2-3945-48e9-ab40-f7c7d2fb4bfc	Vacina Polivalente	2026-03-18 00:00:00	2026-04-08 00:00:00	\N	\N	\N	7	2026-05-03 15:43:02.169	2026-05-03 15:43:02.169	VACCINE
ad680946-7062-45bc-99ca-1bce435c5dd8	d6af84e2-3945-48e9-ab40-f7c7d2fb4bfc	Vacina Polivalente	2026-04-09 00:00:00	2026-04-30 00:00:00	\N	\N	\N	7	2026-05-03 15:43:29.786	2026-05-03 15:43:29.786	VACCINE
1a79bed5-adf6-4a96-99c9-2fd760f40630	d6af84e2-3945-48e9-ab40-f7c7d2fb4bfc	Vermífugo	2026-02-20 00:00:00	2026-03-06 00:00:00	\N	\N	\N	7	2026-05-03 15:44:21.756	2026-05-03 15:44:21.756	DEWORMER
905fe08b-3cdc-4f6e-8fb5-4c7673d8d6d1	d6af84e2-3945-48e9-ab40-f7c7d2fb4bfc	Vermífugo	2026-03-06 00:00:00	2026-03-20 00:00:00	\N	\N	\N	7	2026-05-03 15:44:36.885	2026-05-03 15:44:36.885	DEWORMER
02857478-d396-4716-8677-8cb4b0abc928	d6af84e2-3945-48e9-ab40-f7c7d2fb4bfc	Vermífugo	2026-03-23 00:00:00	2026-04-10 00:00:00	\N	\N	\N	7	2026-05-03 15:44:52.893	2026-05-03 15:44:52.893	DEWORMER
1ab2f6da-3290-452d-a842-4cde07514b11	d6af84e2-3945-48e9-ab40-f7c7d2fb4bfc	Vermífugo	2026-03-23 00:00:00	2026-05-04 00:00:00	\N	\N	\N	7	2026-05-03 15:45:34.858	2026-05-03 15:45:34.858	DEWORMER
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
61a55387-eedf-4e14-96bd-de740d19d93a	025facca85b297482076c6428d1130b4fb4e76a97c91b59e73fcf9087cbe5bbd	2026-04-14 12:28:21.313089+00	20260410202446_init	\N	\N	2026-04-14 12:28:21.221691+00	1
5e318cb7-af6f-4315-a047-7b5cb10ba172	83f74de007d3d9f4c9fcc7a8ee67faaf3c78a0630e57f110fa74189a763576b5	2026-04-14 12:28:21.322032+00	20260411004505_add_vaccine_category	\N	\N	2026-04-14 12:28:21.31467+00	1
\.


--
-- Name: Appointment Appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY (id);


--
-- Name: Medication Medication_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Medication"
    ADD CONSTRAINT "Medication_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Pet Pet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pet"
    ADD CONSTRAINT "Pet_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Vaccine Vaccine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vaccine"
    ADD CONSTRAINT "Vaccine_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Appointment Appointment_petId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_petId_fkey" FOREIGN KEY ("petId") REFERENCES public."Pet"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Medication Medication_petId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Medication"
    ADD CONSTRAINT "Medication_petId_fkey" FOREIGN KEY ("petId") REFERENCES public."Pet"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_petId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_petId_fkey" FOREIGN KEY ("petId") REFERENCES public."Pet"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Pet Pet_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pet"
    ADD CONSTRAINT "Pet_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Vaccine Vaccine_petId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vaccine"
    ADD CONSTRAINT "Vaccine_petId_fkey" FOREIGN KEY ("petId") REFERENCES public."Pet"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict NVutgpvhsBDMmmYI2ESqJrLlhZdP2QTDWPpDLMtdTGZBJAEbG9lp93b6wxfW592

