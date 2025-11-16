--
-- PostgreSQL database dump
--

-- Dumped from database version 14.19 (Ubuntu 14.19-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 17.0

-- Started on 2025-11-15 14:32:27

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE nas_db;
--
-- TOC entry 3635 (class 1262 OID 16385)
-- Name: nas_db; Type: DATABASE; Schema: -; Owner: aranha
--

CREATE DATABASE nas_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C.UTF-8';


ALTER DATABASE nas_db OWNER TO aranha;

\connect nas_db

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: aranha
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO aranha;

--
-- TOC entry 3636 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: aranha
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 228 (class 1259 OID 17559)
-- Name: app_config; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.app_config (
    config_key character varying(50) NOT NULL,
    config_value character varying(255) NOT NULL,
    last_updated timestamp with time zone DEFAULT now()
);


ALTER TABLE public.app_config OWNER TO aranha;

--
-- TOC entry 244 (class 1259 OID 17939)
-- Name: artist_links; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.artist_links (
    id integer NOT NULL,
    discord_id character varying(50) NOT NULL,
    artist_id character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.artist_links OWNER TO aranha;

--
-- TOC entry 3638 (class 0 OID 0)
-- Dependencies: 244
-- Name: TABLE artist_links; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON TABLE public.artist_links IS 'Links Discord IDs to Spotify Artist IDs for admin tracking (Artist Linking feature).';


--
-- TOC entry 243 (class 1259 OID 17938)
-- Name: artist_links_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.artist_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.artist_links_id_seq OWNER TO aranha;

--
-- TOC entry 3639 (class 0 OID 0)
-- Dependencies: 243
-- Name: artist_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.artist_links_id_seq OWNED BY public.artist_links.id;


--
-- TOC entry 209 (class 1259 OID 16391)
-- Name: artiststodiscord; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.artiststodiscord (
    id integer NOT NULL,
    user_name character varying(50),
    discord_id character varying(50),
    spotify_artist_id character varying(50)
);


ALTER TABLE public.artiststodiscord OWNER TO aranha;

--
-- TOC entry 210 (class 1259 OID 16394)
-- Name: artists_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.artists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.artists_id_seq OWNER TO aranha;

--
-- TOC entry 3640 (class 0 OID 0)
-- Dependencies: 210
-- Name: artists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.artists_id_seq OWNED BY public.artiststodiscord.id;


--
-- TOC entry 242 (class 1259 OID 17930)
-- Name: bonus_points; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.bonus_points (
    id integer NOT NULL,
    discord_id character varying(50) NOT NULL,
    date timestamp with time zone DEFAULT now(),
    reason character varying(255) NOT NULL,
    points numeric(6,2) DEFAULT 0,
    week_number integer,
    year integer
);


ALTER TABLE public.bonus_points OWNER TO aranha;

--
-- TOC entry 3641 (class 0 OID 0)
-- Dependencies: 242
-- Name: TABLE bonus_points; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON TABLE public.bonus_points IS 'Stores manual bonus point adjustments made by admins/mods.';


--
-- TOC entry 241 (class 1259 OID 17929)
-- Name: bonus_points_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.bonus_points_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bonus_points_id_seq OWNER TO aranha;

--
-- TOC entry 3642 (class 0 OID 0)
-- Dependencies: 241
-- Name: bonus_points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.bonus_points_id_seq OWNED BY public.bonus_points.id;


--
-- TOC entry 250 (class 1259 OID 18003)
-- Name: lfm_job_queue; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.lfm_job_queue (
    id bigint NOT NULL,
    job_type character varying(32) NOT NULL,
    status character varying(16) DEFAULT 'PENDING'::character varying NOT NULL,
    session_id integer,
    discord_id character varying(64),
    payload jsonb,
    run_after timestamp with time zone DEFAULT now() NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    max_attempts integer DEFAULT 3 NOT NULL,
    last_error text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.lfm_job_queue OWNER TO aranha;

--
-- TOC entry 249 (class 1259 OID 18002)
-- Name: lfm_job_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.lfm_job_queue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lfm_job_queue_id_seq OWNER TO aranha;

--
-- TOC entry 3643 (class 0 OID 0)
-- Dependencies: 249
-- Name: lfm_job_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.lfm_job_queue_id_seq OWNED BY public.lfm_job_queue.id;


--
-- TOC entry 246 (class 1259 OID 17949)
-- Name: lfm_playlist_sessions; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.lfm_playlist_sessions (
    id integer NOT NULL,
    user_lastfm_link_id integer NOT NULL,
    discord_id character varying(64) NOT NULL,
    lastfm_username character varying(64) NOT NULL,
    playlist_id character varying(128) NOT NULL,
    start_link text NOT NULL,
    challenge_track_id character varying(128),
    challenge_track_name text,
    challenge_track_artist text,
    webplayer_hmac character varying(255),
    window_minutes integer DEFAULT 105 NOT NULL,
    status character varying(32) DEFAULT 'OPEN'::character varying NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lfm_playlist_sessions OWNER TO aranha;

--
-- TOC entry 245 (class 1259 OID 17948)
-- Name: lfm_playlist_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.lfm_playlist_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lfm_playlist_sessions_id_seq OWNER TO aranha;

--
-- TOC entry 3644 (class 0 OID 0)
-- Dependencies: 245
-- Name: lfm_playlist_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.lfm_playlist_sessions_id_seq OWNED BY public.lfm_playlist_sessions.id;


--
-- TOC entry 248 (class 1259 OID 17977)
-- Name: lfm_scrobbles_raw; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.lfm_scrobbles_raw (
    id integer NOT NULL,
    session_id integer NOT NULL,
    discord_id character varying(64) NOT NULL,
    lastfm_username character varying(64) NOT NULL,
    track_mbid character varying(64),
    track_name text NOT NULL,
    artist_mbid character varying(64),
    artist_name text NOT NULL,
    album_name text,
    played_at timestamp with time zone NOT NULL,
    source character varying(32) DEFAULT 'lastfm'::character varying NOT NULL,
    raw_payload jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lfm_scrobbles_raw OWNER TO aranha;

--
-- TOC entry 247 (class 1259 OID 17976)
-- Name: lfm_scrobbles_raw_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.lfm_scrobbles_raw_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lfm_scrobbles_raw_id_seq OWNER TO aranha;

--
-- TOC entry 3645 (class 0 OID 0)
-- Dependencies: 247
-- Name: lfm_scrobbles_raw_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.lfm_scrobbles_raw_id_seq OWNED BY public.lfm_scrobbles_raw.id;


--
-- TOC entry 232 (class 1259 OID 17800)
-- Name: playlist_catalog; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.playlist_catalog (
    playlist_id character varying(100) NOT NULL,
    name character varying(255),
    snapshot_version integer DEFAULT 1,
    is_active boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.playlist_catalog OWNER TO aranha;

--
-- TOC entry 3646 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE playlist_catalog; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON TABLE public.playlist_catalog IS '[NAS 2.0] Catálogo mestre das playlists NAS (Blueprint Item 6)';


--
-- TOC entry 240 (class 1259 OID 17892)
-- Name: playlist_sessions; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.playlist_sessions (
    session_id bigint NOT NULL,
    session_token character varying(128) NOT NULL,
    discord_id character varying(50) NOT NULL,
    lastfm_username character varying(100) NOT NULL,
    playlist_id character varying(100) NOT NULL,
    device_type character varying(20) DEFAULT 'unknown'::character varying,
    confidence character varying(20) DEFAULT 'Pending'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    started_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    ended_at timestamp with time zone
);


ALTER TABLE public.playlist_sessions OWNER TO aranha;

--
-- TOC entry 3647 (class 0 OID 0)
-- Dependencies: 240
-- Name: TABLE playlist_sessions; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON TABLE public.playlist_sessions IS '[NAS 2.0] Sessões de audição ativas (Blueprint Item 6 & 9)';


--
-- TOC entry 239 (class 1259 OID 17891)
-- Name: playlist_sessions_session_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.playlist_sessions_session_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playlist_sessions_session_id_seq OWNER TO aranha;

--
-- TOC entry 3648 (class 0 OID 0)
-- Dependencies: 239
-- Name: playlist_sessions_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.playlist_sessions_session_id_seq OWNED BY public.playlist_sessions.session_id;


--
-- TOC entry 234 (class 1259 OID 17809)
-- Name: playlist_tracks_snapshot; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.playlist_tracks_snapshot (
    id integer NOT NULL,
    playlist_id character varying(100) NOT NULL,
    snapshot_version integer NOT NULL,
    "position" integer,
    artist character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    track_id character varying(64) NOT NULL,
    mbid character varying(36)
);


ALTER TABLE public.playlist_tracks_snapshot OWNER TO aranha;

--
-- TOC entry 3649 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE playlist_tracks_snapshot; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON TABLE public.playlist_tracks_snapshot IS '[NAS 2.0] Snapshot offline das faixas (Blueprint Item 6 & 8)';


--
-- TOC entry 233 (class 1259 OID 17808)
-- Name: playlist_tracks_snapshot_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.playlist_tracks_snapshot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playlist_tracks_snapshot_id_seq OWNER TO aranha;

--
-- TOC entry 3650 (class 0 OID 0)
-- Dependencies: 233
-- Name: playlist_tracks_snapshot_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.playlist_tracks_snapshot_id_seq OWNED BY public.playlist_tracks_snapshot.id;


--
-- TOC entry 211 (class 1259 OID 16395)
-- Name: playlists; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.playlists (
    id integer NOT NULL,
    spotify_playlist_id character varying(100) NOT NULL,
    name character varying(255),
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.playlists OWNER TO aranha;

--
-- TOC entry 212 (class 1259 OID 16400)
-- Name: playlists_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.playlists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playlists_id_seq OWNER TO aranha;

--
-- TOC entry 3651 (class 0 OID 0)
-- Dependencies: 212
-- Name: playlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.playlists_id_seq OWNED BY public.playlists.id;


--
-- TOC entry 238 (class 1259 OID 17838)
-- Name: plays; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.plays (
    id bigint NOT NULL,
    discord_id character varying(50) NOT NULL,
    lastfm_username character varying(100),
    playlist_id character varying(100) NOT NULL,
    track_id character varying(64),
    played_at timestamp with time zone NOT NULL,
    confidence character varying(20) NOT NULL,
    window_id character varying(100),
    points numeric(6,2) DEFAULT 0
);


ALTER TABLE public.plays OWNER TO aranha;

--
-- TOC entry 3652 (class 0 OID 0)
-- Dependencies: 238
-- Name: TABLE plays; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON TABLE public.plays IS '[NAS 2.0] Registros de plays validados e pontuados (Blueprint Item 6)';


--
-- TOC entry 237 (class 1259 OID 17837)
-- Name: plays_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.plays_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plays_id_seq OWNER TO aranha;

--
-- TOC entry 3653 (class 0 OID 0)
-- Dependencies: 237
-- Name: plays_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.plays_id_seq OWNED BY public.plays.id;


--
-- TOC entry 254 (class 1259 OID 18038)
-- Name: plays_unverified; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.plays_unverified (
    id bigint NOT NULL,
    session_id integer NOT NULL,
    discord_id character varying(64) NOT NULL,
    lastfm_username character varying(64) NOT NULL,
    track_name_norm text NOT NULL,
    artist_name_norm text NOT NULL,
    ts_start timestamp with time zone NOT NULL,
    ts_end timestamp with time zone NOT NULL,
    duration_ms integer,
    scrobble_pre_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.plays_unverified OWNER TO aranha;

--
-- TOC entry 253 (class 1259 OID 18037)
-- Name: plays_unverified_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.plays_unverified_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plays_unverified_id_seq OWNER TO aranha;

--
-- TOC entry 3654 (class 0 OID 0)
-- Dependencies: 253
-- Name: plays_unverified_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.plays_unverified_id_seq OWNED BY public.plays_unverified.id;


--
-- TOC entry 256 (class 1259 OID 18058)
-- Name: plays_verified; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.plays_verified (
    id bigint NOT NULL,
    session_id integer NOT NULL,
    discord_id character varying(64) NOT NULL,
    lastfm_username character varying(64) NOT NULL,
    track_name_norm text NOT NULL,
    artist_name_norm text NOT NULL,
    ts_start timestamp with time zone NOT NULL,
    ts_end timestamp with time zone NOT NULL,
    duration_ms integer,
    valid_start_link boolean DEFAULT false,
    valid_challenge boolean DEFAULT false,
    valid_density boolean DEFAULT false,
    valid_sequence boolean DEFAULT false,
    global_valid boolean DEFAULT false,
    hmac_signature text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.plays_verified OWNER TO aranha;

--
-- TOC entry 255 (class 1259 OID 18057)
-- Name: plays_verified_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.plays_verified_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plays_verified_id_seq OWNER TO aranha;

--
-- TOC entry 3655 (class 0 OID 0)
-- Dependencies: 255
-- Name: plays_verified_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.plays_verified_id_seq OWNED BY public.plays_verified.id;


--
-- TOC entry 213 (class 1259 OID 16401)
-- Name: scores; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.scores (
    id integer NOT NULL,
    user_id bigint,
    date date NOT NULL,
    total_seconds_played integer DEFAULT 0,
    points numeric(6,2) DEFAULT 0
);


ALTER TABLE public.scores OWNER TO aranha;

--
-- TOC entry 214 (class 1259 OID 16406)
-- Name: scores_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.scores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scores_id_seq OWNER TO aranha;

--
-- TOC entry 3656 (class 0 OID 0)
-- Dependencies: 214
-- Name: scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.scores_id_seq OWNED BY public.scores.id;


--
-- TOC entry 252 (class 1259 OID 18018)
-- Name: scrobbles_preprocess; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.scrobbles_preprocess (
    id bigint NOT NULL,
    scrobble_id integer NOT NULL,
    session_id integer NOT NULL,
    discord_id character varying(64) NOT NULL,
    lastfm_username character varying(64) NOT NULL,
    track_name_norm text NOT NULL,
    artist_name_norm text NOT NULL,
    played_at timestamp with time zone NOT NULL,
    duration_ms integer,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.scrobbles_preprocess OWNER TO aranha;

--
-- TOC entry 251 (class 1259 OID 18017)
-- Name: scrobbles_preprocess_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.scrobbles_preprocess_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scrobbles_preprocess_id_seq OWNER TO aranha;

--
-- TOC entry 3657 (class 0 OID 0)
-- Dependencies: 251
-- Name: scrobbles_preprocess_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.scrobbles_preprocess_id_seq OWNED BY public.scrobbles_preprocess.id;


--
-- TOC entry 236 (class 1259 OID 17826)
-- Name: scrobbles_raw; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.scrobbles_raw (
    id bigint NOT NULL,
    source character varying(20) DEFAULT 'lastfm'::character varying,
    lastfm_username character varying(100),
    artist character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    mbid character varying(36),
    played_at timestamp with time zone NOT NULL,
    ingested_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.scrobbles_raw OWNER TO aranha;

--
-- TOC entry 3658 (class 0 OID 0)
-- Dependencies: 236
-- Name: TABLE scrobbles_raw; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON TABLE public.scrobbles_raw IS '[NAS 2.0] Ingestão bruta de scrobbles do Last.fm (Blueprint Item 6)';


--
-- TOC entry 235 (class 1259 OID 17825)
-- Name: scrobbles_raw_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.scrobbles_raw_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scrobbles_raw_id_seq OWNER TO aranha;

--
-- TOC entry 3659 (class 0 OID 0)
-- Dependencies: 235
-- Name: scrobbles_raw_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.scrobbles_raw_id_seq OWNED BY public.scrobbles_raw.id;


--
-- TOC entry 227 (class 1259 OID 16984)
-- Name: spotify_apps; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.spotify_apps (
    id integer NOT NULL,
    client_id character varying(255) NOT NULL,
    client_secret character varying(255) NOT NULL,
    user_count integer DEFAULT 0,
    is_full boolean DEFAULT false,
    app_name character varying(100),
    redirect_uri character varying(255)
);


ALTER TABLE public.spotify_apps OWNER TO aranha;

--
-- TOC entry 215 (class 1259 OID 16407)
-- Name: spotifytodiscord; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.spotifytodiscord (
    user_name character varying(50),
    discord_id character varying(50),
    spotify_id character varying(50),
    id integer NOT NULL
);


ALTER TABLE public.spotifytodiscord OWNER TO aranha;

--
-- TOC entry 216 (class 1259 OID 16410)
-- Name: spotifytodiscord_source_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.spotifytodiscord_source_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.spotifytodiscord_source_id_seq OWNER TO aranha;

--
-- TOC entry 3660 (class 0 OID 0)
-- Dependencies: 216
-- Name: spotifytodiscord_source_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.spotifytodiscord_source_id_seq OWNED BY public.spotifytodiscord.id;


--
-- TOC entry 226 (class 1259 OID 16883)
-- Name: submission_logs; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.submission_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    submission_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    spotify_id character varying(255),
    submission_type character varying(10) DEFAULT 'manual'::character varying
);


ALTER TABLE public.submission_logs OWNER TO aranha;

--
-- TOC entry 3661 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE submission_logs; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON TABLE public.submission_logs IS 'Tracks each successful submission''s timestamp for a 24-hour sliding window limit.';


--
-- TOC entry 225 (class 1259 OID 16882)
-- Name: submission_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.submission_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.submission_logs_id_seq OWNER TO aranha;

--
-- TOC entry 3662 (class 0 OID 0)
-- Dependencies: 225
-- Name: submission_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.submission_logs_id_seq OWNED BY public.submission_logs.id;


--
-- TOC entry 217 (class 1259 OID 16419)
-- Name: tracks_played; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.tracks_played (
    id integer NOT NULL,
    spotify_track_id character varying(100),
    track_name character varying(255),
    artist_name character varying(255),
    duration_seconds integer,
    played_at timestamp without time zone NOT NULL,
    playlist_id character varying(100),
    playlist_name character varying(255),
    user_id bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    spotify_id character varying(100)
);


ALTER TABLE public.tracks_played OWNER TO aranha;

--
-- TOC entry 218 (class 1259 OID 16425)
-- Name: tracks_played_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.tracks_played_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tracks_played_id_seq OWNER TO aranha;

--
-- TOC entry 3663 (class 0 OID 0)
-- Dependencies: 218
-- Name: tracks_played_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.tracks_played_id_seq OWNED BY public.tracks_played.id;


--
-- TOC entry 229 (class 1259 OID 17773)
-- Name: user_identity; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.user_identity (
    discord_id character varying(50) NOT NULL,
    artist_spotify_id character varying(50),
    tier integer DEFAULT 1,
    is_mod boolean DEFAULT false,
    is_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    last_seen_at timestamp with time zone
);


ALTER TABLE public.user_identity OWNER TO aranha;

--
-- TOC entry 3664 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE user_identity; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON TABLE public.user_identity IS '[NAS 2.0] Tabela central de identidade do artista (Blueprint Item 6)';


--
-- TOC entry 231 (class 1259 OID 17783)
-- Name: user_lastfm_links; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.user_lastfm_links (
    id integer NOT NULL,
    discord_id character varying(50) NOT NULL,
    lastfm_username character varying(100) NOT NULL,
    session_key text,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    revoked_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.user_lastfm_links OWNER TO aranha;

--
-- TOC entry 3665 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE user_lastfm_links; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON TABLE public.user_lastfm_links IS '[NAS 2.0] Contas Last.fm por usuário e status de ativação (Blueprint Item 6)';


--
-- TOC entry 230 (class 1259 OID 17782)
-- Name: user_lastfm_links_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.user_lastfm_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_lastfm_links_id_seq OWNER TO aranha;

--
-- TOC entry 3666 (class 0 OID 0)
-- Dependencies: 230
-- Name: user_lastfm_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.user_lastfm_links_id_seq OWNED BY public.user_lastfm_links.id;


--
-- TOC entry 219 (class 1259 OID 16426)
-- Name: user_playlist_scores; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.user_playlist_scores (
    id integer NOT NULL,
    spotify_id character varying(255) NOT NULL,
    playlist_id character varying(255) NOT NULL,
    playlist_name character varying(255) NOT NULL,
    accumulated_ms bigint DEFAULT 0 NOT NULL,
    last_updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    week_number integer NOT NULL,
    year integer NOT NULL,
    discord_id character varying(255)
);


ALTER TABLE public.user_playlist_scores OWNER TO aranha;

--
-- TOC entry 220 (class 1259 OID 16433)
-- Name: user_playlist_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.user_playlist_scores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_playlist_scores_id_seq OWNER TO aranha;

--
-- TOC entry 3667 (class 0 OID 0)
-- Dependencies: 220
-- Name: user_playlist_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.user_playlist_scores_id_seq OWNED BY public.user_playlist_scores.id;


--
-- TOC entry 221 (class 1259 OID 16434)
-- Name: user_streams; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.user_streams (
    id integer NOT NULL,
    spotify_id text NOT NULL,
    track_id text NOT NULL,
    played_at timestamp without time zone NOT NULL,
    points integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.user_streams OWNER TO aranha;

--
-- TOC entry 222 (class 1259 OID 16440)
-- Name: user_streams_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.user_streams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_streams_id_seq OWNER TO aranha;

--
-- TOC entry 3668 (class 0 OID 0)
-- Dependencies: 222
-- Name: user_streams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.user_streams_id_seq OWNED BY public.user_streams.id;


--
-- TOC entry 223 (class 1259 OID 16441)
-- Name: users; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.users (
    id integer NOT NULL,
    spotify_id character varying(100),
    spotify_username character varying(100),
    discord_id character varying(100),
    discord_username character varying(100),
    tier integer DEFAULT 1,
    is_mod boolean DEFAULT false,
    is_admin boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_auto_submit_active boolean DEFAULT false,
    spotify_refresh_token_encrypted text,
    last_processed_at timestamp with time zone,
    spotify_app_id integer,
    auto_cycle_started_at timestamp with time zone,
    auto_cycle_count integer DEFAULT 0,
    auto_cycle_window_interval interval DEFAULT '24:00:00'::interval NOT NULL,
    auto_cycle_limit integer DEFAULT 8 NOT NULL,
    auto_cycle_cooldown_until timestamp with time zone,
    auto_last_submission_at timestamp with time zone,
    weekly_score_limit_reached boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO aranha;

--
-- TOC entry 3669 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN users.auto_cycle_started_at; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON COLUMN public.users.auto_cycle_started_at IS 'Timestamp (UTC) when the current auto-submit cycle began.';


--
-- TOC entry 3670 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN users.auto_cycle_count; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON COLUMN public.users.auto_cycle_count IS 'Number of successful ''auto'' submissions completed in the current cycle.';


--
-- TOC entry 3671 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN users.auto_cycle_window_interval; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON COLUMN public.users.auto_cycle_window_interval IS 'Duration of the cooldown period that starts after the cycle limit is reached.';


--
-- TOC entry 3672 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN users.auto_cycle_limit; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON COLUMN public.users.auto_cycle_limit IS 'Maximum number of ''auto'' submissions allowed per cycle.';


--
-- TOC entry 3673 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN users.auto_cycle_cooldown_until; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON COLUMN public.users.auto_cycle_cooldown_until IS 'Timestamp (UTC) until which the user is in cooldown and cannot start a new auto-submit cycle.';


--
-- TOC entry 3674 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN users.auto_last_submission_at; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON COLUMN public.users.auto_last_submission_at IS 'Timestamp (UTC) of the last successful ''auto'' submission within the current cycle.';


--
-- TOC entry 3675 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN users.weekly_score_limit_reached; Type: COMMENT; Schema: public; Owner: aranha
--

COMMENT ON COLUMN public.users.weekly_score_limit_reached IS 'Flag indicating if the user has reached the weekly score limit for the current scoring period.';


--
-- TOC entry 224 (class 1259 OID 16448)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO aranha;

--
-- TOC entry 3676 (class 0 OID 0)
-- Dependencies: 224
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 258 (class 1259 OID 18078)
-- Name: validation_logs; Type: TABLE; Schema: public; Owner: aranha
--

CREATE TABLE public.validation_logs (
    id bigint NOT NULL,
    play_unverified_id bigint,
    session_id integer NOT NULL,
    discord_id character varying(64) NOT NULL,
    validator text NOT NULL,
    result boolean NOT NULL,
    info jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.validation_logs OWNER TO aranha;

--
-- TOC entry 257 (class 1259 OID 18077)
-- Name: validation_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: aranha
--

CREATE SEQUENCE public.validation_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.validation_logs_id_seq OWNER TO aranha;

--
-- TOC entry 3677 (class 0 OID 0)
-- Dependencies: 257
-- Name: validation_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aranha
--

ALTER SEQUENCE public.validation_logs_id_seq OWNED BY public.validation_logs.id;


--
-- TOC entry 3353 (class 2604 OID 17942)
-- Name: artist_links id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.artist_links ALTER COLUMN id SET DEFAULT nextval('public.artist_links_id_seq'::regclass);


--
-- TOC entry 3298 (class 2604 OID 16450)
-- Name: artiststodiscord id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.artiststodiscord ALTER COLUMN id SET DEFAULT nextval('public.artists_id_seq'::regclass);


--
-- TOC entry 3350 (class 2604 OID 17933)
-- Name: bonus_points id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.bonus_points ALTER COLUMN id SET DEFAULT nextval('public.bonus_points_id_seq'::regclass);


--
-- TOC entry 3365 (class 2604 OID 18006)
-- Name: lfm_job_queue id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.lfm_job_queue ALTER COLUMN id SET DEFAULT nextval('public.lfm_job_queue_id_seq'::regclass);


--
-- TOC entry 3355 (class 2604 OID 17952)
-- Name: lfm_playlist_sessions id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.lfm_playlist_sessions ALTER COLUMN id SET DEFAULT nextval('public.lfm_playlist_sessions_id_seq'::regclass);


--
-- TOC entry 3361 (class 2604 OID 17980)
-- Name: lfm_scrobbles_raw id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.lfm_scrobbles_raw ALTER COLUMN id SET DEFAULT nextval('public.lfm_scrobbles_raw_id_seq'::regclass);


--
-- TOC entry 3345 (class 2604 OID 17895)
-- Name: playlist_sessions session_id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.playlist_sessions ALTER COLUMN session_id SET DEFAULT nextval('public.playlist_sessions_session_id_seq'::regclass);


--
-- TOC entry 3339 (class 2604 OID 17812)
-- Name: playlist_tracks_snapshot id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.playlist_tracks_snapshot ALTER COLUMN id SET DEFAULT nextval('public.playlist_tracks_snapshot_id_seq'::regclass);


--
-- TOC entry 3299 (class 2604 OID 16451)
-- Name: playlists id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.playlists ALTER COLUMN id SET DEFAULT nextval('public.playlists_id_seq'::regclass);


--
-- TOC entry 3343 (class 2604 OID 17841)
-- Name: plays id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.plays ALTER COLUMN id SET DEFAULT nextval('public.plays_id_seq'::regclass);


--
-- TOC entry 3374 (class 2604 OID 18041)
-- Name: plays_unverified id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.plays_unverified ALTER COLUMN id SET DEFAULT nextval('public.plays_unverified_id_seq'::regclass);


--
-- TOC entry 3376 (class 2604 OID 18061)
-- Name: plays_verified id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.plays_verified ALTER COLUMN id SET DEFAULT nextval('public.plays_verified_id_seq'::regclass);


--
-- TOC entry 3302 (class 2604 OID 16452)
-- Name: scores id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.scores ALTER COLUMN id SET DEFAULT nextval('public.scores_id_seq'::regclass);


--
-- TOC entry 3372 (class 2604 OID 18021)
-- Name: scrobbles_preprocess id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.scrobbles_preprocess ALTER COLUMN id SET DEFAULT nextval('public.scrobbles_preprocess_id_seq'::regclass);


--
-- TOC entry 3340 (class 2604 OID 17829)
-- Name: scrobbles_raw id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.scrobbles_raw ALTER COLUMN id SET DEFAULT nextval('public.scrobbles_raw_id_seq'::regclass);


--
-- TOC entry 3305 (class 2604 OID 16453)
-- Name: spotifytodiscord id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.spotifytodiscord ALTER COLUMN id SET DEFAULT nextval('public.spotifytodiscord_source_id_seq'::regclass);


--
-- TOC entry 3323 (class 2604 OID 16886)
-- Name: submission_logs id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.submission_logs ALTER COLUMN id SET DEFAULT nextval('public.submission_logs_id_seq'::regclass);


--
-- TOC entry 3306 (class 2604 OID 16455)
-- Name: tracks_played id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.tracks_played ALTER COLUMN id SET DEFAULT nextval('public.tracks_played_id_seq'::regclass);


--
-- TOC entry 3333 (class 2604 OID 17786)
-- Name: user_lastfm_links id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.user_lastfm_links ALTER COLUMN id SET DEFAULT nextval('public.user_lastfm_links_id_seq'::regclass);


--
-- TOC entry 3308 (class 2604 OID 16456)
-- Name: user_playlist_scores id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.user_playlist_scores ALTER COLUMN id SET DEFAULT nextval('public.user_playlist_scores_id_seq'::regclass);


--
-- TOC entry 3311 (class 2604 OID 16457)
-- Name: user_streams id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.user_streams ALTER COLUMN id SET DEFAULT nextval('public.user_streams_id_seq'::regclass);


--
-- TOC entry 3313 (class 2604 OID 16458)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3383 (class 2604 OID 18081)
-- Name: validation_logs id; Type: DEFAULT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.validation_logs ALTER COLUMN id SET DEFAULT nextval('public.validation_logs_id_seq'::regclass);


--
-- TOC entry 3420 (class 2606 OID 17564)
-- Name: app_config app_config_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.app_config
    ADD CONSTRAINT app_config_pkey PRIMARY KEY (config_key);


--
-- TOC entry 3452 (class 2606 OID 17945)
-- Name: artist_links artist_links_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.artist_links
    ADD CONSTRAINT artist_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3386 (class 2606 OID 16464)
-- Name: artiststodiscord artists_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.artiststodiscord
    ADD CONSTRAINT artists_pkey PRIMARY KEY (id);


--
-- TOC entry 3450 (class 2606 OID 17937)
-- Name: bonus_points bonus_points_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.bonus_points
    ADD CONSTRAINT bonus_points_pkey PRIMARY KEY (id);


--
-- TOC entry 3464 (class 2606 OID 18016)
-- Name: lfm_job_queue lfm_job_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.lfm_job_queue
    ADD CONSTRAINT lfm_job_queue_pkey PRIMARY KEY (id);


--
-- TOC entry 3458 (class 2606 OID 17961)
-- Name: lfm_playlist_sessions lfm_playlist_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.lfm_playlist_sessions
    ADD CONSTRAINT lfm_playlist_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3462 (class 2606 OID 17987)
-- Name: lfm_scrobbles_raw lfm_scrobbles_raw_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.lfm_scrobbles_raw
    ADD CONSTRAINT lfm_scrobbles_raw_pkey PRIMARY KEY (id);


--
-- TOC entry 3431 (class 2606 OID 17807)
-- Name: playlist_catalog playlist_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.playlist_catalog
    ADD CONSTRAINT playlist_catalog_pkey PRIMARY KEY (playlist_id);


--
-- TOC entry 3446 (class 2606 OID 17901)
-- Name: playlist_sessions playlist_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.playlist_sessions
    ADD CONSTRAINT playlist_sessions_pkey PRIMARY KEY (session_id);


--
-- TOC entry 3448 (class 2606 OID 17903)
-- Name: playlist_sessions playlist_sessions_session_token_key; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.playlist_sessions
    ADD CONSTRAINT playlist_sessions_session_token_key UNIQUE (session_token);


--
-- TOC entry 3434 (class 2606 OID 17816)
-- Name: playlist_tracks_snapshot playlist_tracks_snapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.playlist_tracks_snapshot
    ADD CONSTRAINT playlist_tracks_snapshot_pkey PRIMARY KEY (id);


--
-- TOC entry 3436 (class 2606 OID 17818)
-- Name: playlist_tracks_snapshot playlist_tracks_snapshot_playlist_id_snapshot_version_track_key; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.playlist_tracks_snapshot
    ADD CONSTRAINT playlist_tracks_snapshot_playlist_id_snapshot_version_track_key UNIQUE (playlist_id, snapshot_version, track_id);


--
-- TOC entry 3388 (class 2606 OID 16466)
-- Name: playlists playlists_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_pkey PRIMARY KEY (id);


--
-- TOC entry 3390 (class 2606 OID 16468)
-- Name: playlists playlists_spotify_playlist_id_key; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_spotify_playlist_id_key UNIQUE (spotify_playlist_id);


--
-- TOC entry 3442 (class 2606 OID 17844)
-- Name: plays plays_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.plays
    ADD CONSTRAINT plays_pkey PRIMARY KEY (id);


--
-- TOC entry 3468 (class 2606 OID 18046)
-- Name: plays_unverified plays_unverified_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.plays_unverified
    ADD CONSTRAINT plays_unverified_pkey PRIMARY KEY (id);


--
-- TOC entry 3470 (class 2606 OID 18071)
-- Name: plays_verified plays_verified_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.plays_verified
    ADD CONSTRAINT plays_verified_pkey PRIMARY KEY (id);


--
-- TOC entry 3392 (class 2606 OID 16470)
-- Name: scores scores_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT scores_pkey PRIMARY KEY (id);


--
-- TOC entry 3394 (class 2606 OID 16472)
-- Name: scores scores_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT scores_user_id_date_key UNIQUE (user_id, date);


--
-- TOC entry 3466 (class 2606 OID 18026)
-- Name: scrobbles_preprocess scrobbles_preprocess_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.scrobbles_preprocess
    ADD CONSTRAINT scrobbles_preprocess_pkey PRIMARY KEY (id);


--
-- TOC entry 3439 (class 2606 OID 17835)
-- Name: scrobbles_raw scrobbles_raw_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.scrobbles_raw
    ADD CONSTRAINT scrobbles_raw_pkey PRIMARY KEY (id);


--
-- TOC entry 3416 (class 2606 OID 16994)
-- Name: spotify_apps spotify_apps_client_id_key; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.spotify_apps
    ADD CONSTRAINT spotify_apps_client_id_key UNIQUE (client_id);


--
-- TOC entry 3418 (class 2606 OID 16992)
-- Name: spotify_apps spotify_apps_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.spotify_apps
    ADD CONSTRAINT spotify_apps_pkey PRIMARY KEY (id);


--
-- TOC entry 3396 (class 2606 OID 16474)
-- Name: spotifytodiscord spotifytodiscord_source_unique; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.spotifytodiscord
    ADD CONSTRAINT spotifytodiscord_source_unique UNIQUE (id);


--
-- TOC entry 3414 (class 2606 OID 16889)
-- Name: submission_logs submission_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.submission_logs
    ADD CONSTRAINT submission_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3398 (class 2606 OID 16478)
-- Name: tracks_played tracks_played_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.tracks_played
    ADD CONSTRAINT tracks_played_pkey PRIMARY KEY (id);


--
-- TOC entry 3402 (class 2606 OID 16480)
-- Name: user_playlist_scores unique_user_playlist_week_year; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.user_playlist_scores
    ADD CONSTRAINT unique_user_playlist_week_year UNIQUE (discord_id, playlist_id, week_number, year);


--
-- TOC entry 3454 (class 2606 OID 17947)
-- Name: artist_links uq_discord_artist; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.artist_links
    ADD CONSTRAINT uq_discord_artist UNIQUE (discord_id, artist_id);


--
-- TOC entry 3422 (class 2606 OID 17781)
-- Name: user_identity user_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.user_identity
    ADD CONSTRAINT user_identity_pkey PRIMARY KEY (discord_id);


--
-- TOC entry 3425 (class 2606 OID 18000)
-- Name: user_lastfm_links user_lastfm_links_discord_username_uk; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.user_lastfm_links
    ADD CONSTRAINT user_lastfm_links_discord_username_uk UNIQUE (discord_id, lastfm_username);


--
-- TOC entry 3427 (class 2606 OID 17794)
-- Name: user_lastfm_links user_lastfm_links_lastfm_username_key; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.user_lastfm_links
    ADD CONSTRAINT user_lastfm_links_lastfm_username_key UNIQUE (lastfm_username);


--
-- TOC entry 3429 (class 2606 OID 17792)
-- Name: user_lastfm_links user_lastfm_links_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.user_lastfm_links
    ADD CONSTRAINT user_lastfm_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3404 (class 2606 OID 16482)
-- Name: user_playlist_scores user_playlist_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.user_playlist_scores
    ADD CONSTRAINT user_playlist_scores_pkey PRIMARY KEY (id);


--
-- TOC entry 3406 (class 2606 OID 16486)
-- Name: user_streams user_streams_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.user_streams
    ADD CONSTRAINT user_streams_pkey PRIMARY KEY (id);


--
-- TOC entry 3409 (class 2606 OID 16490)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3411 (class 2606 OID 16492)
-- Name: users users_spotify_id_key; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_spotify_id_key UNIQUE (spotify_id);


--
-- TOC entry 3472 (class 2606 OID 18086)
-- Name: validation_logs validation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.validation_logs
    ADD CONSTRAINT validation_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3455 (class 1259 OID 17967)
-- Name: idx_lfm_playlist_sessions_discord; Type: INDEX; Schema: public; Owner: aranha
--

CREATE INDEX idx_lfm_playlist_sessions_discord ON public.lfm_playlist_sessions USING btree (discord_id);


--
-- TOC entry 3456 (class 1259 OID 17968)
-- Name: idx_lfm_playlist_sessions_status; Type: INDEX; Schema: public; Owner: aranha
--

CREATE INDEX idx_lfm_playlist_sessions_status ON public.lfm_playlist_sessions USING btree (status);


--
-- TOC entry 3459 (class 1259 OID 17994)
-- Name: idx_lfm_scrobbles_raw_session; Type: INDEX; Schema: public; Owner: aranha
--

CREATE INDEX idx_lfm_scrobbles_raw_session ON public.lfm_scrobbles_raw USING btree (session_id);


--
-- TOC entry 3460 (class 1259 OID 17993)
-- Name: idx_lfm_scrobbles_raw_unique; Type: INDEX; Schema: public; Owner: aranha
--

CREATE UNIQUE INDEX idx_lfm_scrobbles_raw_unique ON public.lfm_scrobbles_raw USING btree (session_id, track_name, artist_name, played_at);


--
-- TOC entry 3443 (class 1259 OID 17920)
-- Name: idx_one_active_session_per_lfm_user; Type: INDEX; Schema: public; Owner: aranha
--

CREATE UNIQUE INDEX idx_one_active_session_per_lfm_user ON public.playlist_sessions USING btree (lastfm_username) WHERE ((status)::text = 'active'::text);


--
-- TOC entry 3440 (class 1259 OID 17855)
-- Name: idx_plays_user_window; Type: INDEX; Schema: public; Owner: aranha
--

CREATE INDEX idx_plays_user_window ON public.plays USING btree (discord_id, window_id);


--
-- TOC entry 3437 (class 1259 OID 17836)
-- Name: idx_scrobbles_user_time; Type: INDEX; Schema: public; Owner: aranha
--

CREATE INDEX idx_scrobbles_user_time ON public.scrobbles_raw USING btree (lastfm_username, played_at);


--
-- TOC entry 3444 (class 1259 OID 17919)
-- Name: idx_sessions_discord_id; Type: INDEX; Schema: public; Owner: aranha
--

CREATE INDEX idx_sessions_discord_id ON public.playlist_sessions USING btree (discord_id);


--
-- TOC entry 3432 (class 1259 OID 17824)
-- Name: idx_snapshot_track_id; Type: INDEX; Schema: public; Owner: aranha
--

CREATE INDEX idx_snapshot_track_id ON public.playlist_tracks_snapshot USING btree (track_id);


--
-- TOC entry 3412 (class 1259 OID 16895)
-- Name: idx_submission_logs_user_id; Type: INDEX; Schema: public; Owner: aranha
--

CREATE INDEX idx_submission_logs_user_id ON public.submission_logs USING btree (user_id);


--
-- TOC entry 3423 (class 1259 OID 18001)
-- Name: idx_user_lastfm_links_discord; Type: INDEX; Schema: public; Owner: aranha
--

CREATE INDEX idx_user_lastfm_links_discord ON public.user_lastfm_links USING btree (discord_id);


--
-- TOC entry 3399 (class 1259 OID 16495)
-- Name: idx_user_playlist_scores_spotify_id_v2; Type: INDEX; Schema: public; Owner: aranha
--

CREATE INDEX idx_user_playlist_scores_spotify_id_v2 ON public.user_playlist_scores USING btree (spotify_id);


--
-- TOC entry 3400 (class 1259 OID 16496)
-- Name: idx_user_playlist_scores_week_year; Type: INDEX; Schema: public; Owner: aranha
--

CREATE INDEX idx_user_playlist_scores_week_year ON public.user_playlist_scores USING btree (week_number, year);


--
-- TOC entry 3407 (class 1259 OID 17436)
-- Name: idx_users_auto_submit_eligible; Type: INDEX; Schema: public; Owner: aranha
--

CREATE INDEX idx_users_auto_submit_eligible ON public.users USING btree (is_auto_submit_active, auto_cycle_count, auto_cycle_limit, last_processed_at) WHERE (is_auto_submit_active = true);


--
-- TOC entry 3484 (class 2606 OID 17962)
-- Name: lfm_playlist_sessions lfm_playlist_sessions_user_lastfm_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.lfm_playlist_sessions
    ADD CONSTRAINT lfm_playlist_sessions_user_lastfm_link_id_fkey FOREIGN KEY (user_lastfm_link_id) REFERENCES public.user_lastfm_links(id) ON DELETE CASCADE;


--
-- TOC entry 3485 (class 2606 OID 17988)
-- Name: lfm_scrobbles_raw lfm_scrobbles_raw_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.lfm_scrobbles_raw
    ADD CONSTRAINT lfm_scrobbles_raw_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.lfm_playlist_sessions(id) ON DELETE CASCADE;


--
-- TOC entry 3481 (class 2606 OID 17904)
-- Name: playlist_sessions playlist_sessions_discord_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.playlist_sessions
    ADD CONSTRAINT playlist_sessions_discord_id_fkey FOREIGN KEY (discord_id) REFERENCES public.user_identity(discord_id) ON DELETE CASCADE;


--
-- TOC entry 3482 (class 2606 OID 17909)
-- Name: playlist_sessions playlist_sessions_lastfm_username_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.playlist_sessions
    ADD CONSTRAINT playlist_sessions_lastfm_username_fkey FOREIGN KEY (lastfm_username) REFERENCES public.user_lastfm_links(lastfm_username) ON DELETE CASCADE;


--
-- TOC entry 3483 (class 2606 OID 17914)
-- Name: playlist_sessions playlist_sessions_playlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.playlist_sessions
    ADD CONSTRAINT playlist_sessions_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlist_catalog(playlist_id);


--
-- TOC entry 3478 (class 2606 OID 17819)
-- Name: playlist_tracks_snapshot playlist_tracks_snapshot_playlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.playlist_tracks_snapshot
    ADD CONSTRAINT playlist_tracks_snapshot_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlist_catalog(playlist_id) ON DELETE CASCADE;


--
-- TOC entry 3479 (class 2606 OID 17845)
-- Name: plays plays_discord_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.plays
    ADD CONSTRAINT plays_discord_id_fkey FOREIGN KEY (discord_id) REFERENCES public.user_identity(discord_id);


--
-- TOC entry 3480 (class 2606 OID 17850)
-- Name: plays plays_playlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.plays
    ADD CONSTRAINT plays_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlist_catalog(playlist_id);


--
-- TOC entry 3488 (class 2606 OID 18052)
-- Name: plays_unverified plays_unverified_scrobble_pre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.plays_unverified
    ADD CONSTRAINT plays_unverified_scrobble_pre_id_fkey FOREIGN KEY (scrobble_pre_id) REFERENCES public.scrobbles_preprocess(id) ON DELETE CASCADE;


--
-- TOC entry 3489 (class 2606 OID 18047)
-- Name: plays_unverified plays_unverified_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.plays_unverified
    ADD CONSTRAINT plays_unverified_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.lfm_playlist_sessions(id) ON DELETE CASCADE;


--
-- TOC entry 3490 (class 2606 OID 18072)
-- Name: plays_verified plays_verified_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.plays_verified
    ADD CONSTRAINT plays_verified_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.lfm_playlist_sessions(id) ON DELETE CASCADE;


--
-- TOC entry 3473 (class 2606 OID 16497)
-- Name: scores scores_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3486 (class 2606 OID 18027)
-- Name: scrobbles_preprocess scrobbles_preprocess_scrobble_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.scrobbles_preprocess
    ADD CONSTRAINT scrobbles_preprocess_scrobble_id_fkey FOREIGN KEY (scrobble_id) REFERENCES public.lfm_scrobbles_raw(id) ON DELETE CASCADE;


--
-- TOC entry 3487 (class 2606 OID 18032)
-- Name: scrobbles_preprocess scrobbles_preprocess_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.scrobbles_preprocess
    ADD CONSTRAINT scrobbles_preprocess_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.lfm_playlist_sessions(id) ON DELETE CASCADE;


--
-- TOC entry 3476 (class 2606 OID 16890)
-- Name: submission_logs submission_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.submission_logs
    ADD CONSTRAINT submission_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3474 (class 2606 OID 16502)
-- Name: tracks_played tracks_played_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.tracks_played
    ADD CONSTRAINT tracks_played_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3477 (class 2606 OID 17795)
-- Name: user_lastfm_links user_lastfm_links_discord_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.user_lastfm_links
    ADD CONSTRAINT user_lastfm_links_discord_id_fkey FOREIGN KEY (discord_id) REFERENCES public.user_identity(discord_id) ON DELETE CASCADE;


--
-- TOC entry 3475 (class 2606 OID 16998)
-- Name: users users_spotify_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aranha
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_spotify_app_id_fkey FOREIGN KEY (spotify_app_id) REFERENCES public.spotify_apps(id);


--
-- TOC entry 3637 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: aranha
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- TOC entry 2151 (class 826 OID 16507)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: aranha
--

ALTER DEFAULT PRIVILEGES FOR ROLE aranha IN SCHEMA public GRANT ALL ON SEQUENCES TO aranha;


-- Completed on 2025-11-15 14:32:57

--
-- PostgreSQL database dump complete
--

