export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activation_code_usages: {
        Row: {
          activated_at: string
          code_id: string
          id: string
          user_id: string
        }
        Insert: {
          activated_at?: string
          code_id: string
          id?: string
          user_id: string
        }
        Update: {
          activated_at?: string
          code_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activation_code_usages_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "activation_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      activation_codes: {
        Row: {
          assigned_user_id: string | null
          code: string
          created_at: string
          created_by: string | null
          duration_days: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          plan_id: string | null
          used_count: number | null
        }
        Insert: {
          assigned_user_id?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          duration_days?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          plan_id?: string | null
          used_count?: number | null
        }
        Update: {
          assigned_user_id?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          duration_days?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          plan_id?: string | null
          used_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "activation_codes_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      answer_choices: {
        Row: {
          choice_letter: string
          choice_text: string
          explanation: string | null
          id: string
          is_correct: boolean
          question_id: string
        }
        Insert: {
          choice_letter: string
          choice_text: string
          explanation?: string | null
          id?: string
          is_correct?: boolean
          question_id: string
        }
        Update: {
          choice_letter?: string
          choice_text?: string
          explanation?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answer_choices_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          created_at: string
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      login_history: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medical_library_articles: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean | null
          slug: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          slug: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_library_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "medical_library_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_library_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          order_index: number | null
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_index?: number | null
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_index?: number | null
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_library_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "medical_library_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_library_sections: {
        Row: {
          article_id: string
          content: string
          created_at: string
          id: string
          level: number | null
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string
          id?: string
          level?: number | null
          order_index: number
          title: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          id?: string
          level?: number | null
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_library_sections_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "medical_library_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          question_id: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          question_id?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          question_id?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          exam_access: boolean | null
          id: string
          is_active: boolean | null
          name: string
          notes_access: boolean | null
          price_cents: number | null
          qbank_access: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days?: number
          exam_access?: boolean | null
          id?: string
          is_active?: boolean | null
          name: string
          notes_access?: boolean | null
          price_cents?: number | null
          qbank_access?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          exam_access?: boolean | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes_access?: boolean | null
          price_cents?: number | null
          qbank_access?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          academic_year: string | null
          activation_code: string | null
          country: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          semester: string | null
          university_id: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          academic_year?: string | null
          activation_code?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          semester?: string | null
          university_id?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          academic_year?: string | null
          activation_code?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          semester?: string | null
          university_id?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      question_feedback: {
        Row: {
          created_at: string
          id: string
          issue_type: string
          message: string
          question_id: string
          status: string
          test_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_type?: string
          message: string
          question_id: string
          status?: string
          test_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_type?: string
          message?: string
          question_id?: string
          status?: string
          test_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_feedback_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_feedback_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      question_highlights: {
        Row: {
          color: string | null
          created_at: string
          end_offset: number | null
          id: string
          question_id: string
          selected_text: string
          start_offset: number | null
          target_id: string | null
          target_type: string
          test_id: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          end_offset?: number | null
          id?: string
          question_id: string
          selected_text: string
          start_offset?: number | null
          target_id?: string | null
          target_type?: string
          test_id?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          end_offset?: number | null
          id?: string
          question_id?: string
          selected_text?: string
          start_offset?: number | null
          target_id?: string | null
          target_type?: string
          test_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_highlights_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_highlights_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      question_sets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      question_strikeouts: {
        Row: {
          choice_id: string
          created_at: string
          id: string
          is_struck: boolean | null
          question_id: string
          test_id: string | null
          user_id: string
        }
        Insert: {
          choice_id: string
          created_at?: string
          id?: string
          is_struck?: boolean | null
          question_id: string
          test_id?: string | null
          user_id: string
        }
        Update: {
          choice_id?: string
          created_at?: string
          id?: string
          is_struck?: boolean | null
          question_id?: string
          test_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_strikeouts_choice_id_fkey"
            columns: ["choice_id"]
            isOneToOne: false
            referencedRelation: "answer_choices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_strikeouts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_strikeouts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          academic_year: string | null
          created_at: string
          difficulty: string | null
          explanation: string | null
          id: string
          is_active: boolean | null
          public_id: number
          question_set_id: string | null
          question_text: string
          semester: string | null
          subject_id: string | null
          system_id: string | null
          topic_id: string | null
        }
        Insert: {
          academic_year?: string | null
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          public_id?: number
          question_set_id?: string | null
          question_text: string
          semester?: string | null
          subject_id?: string | null
          system_id?: string | null
          topic_id?: string | null
        }
        Update: {
          academic_year?: string | null
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          public_id?: number
          question_set_id?: string | null
          question_text?: string
          semester?: string | null
          subject_id?: string | null
          system_id?: string | null
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_question_set_id_fkey"
            columns: ["question_set_id"]
            isOneToOne: false
            referencedRelation: "question_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          category: string | null
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      subjects: {
        Row: {
          category: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          question_count: number
        }
        Insert: {
          category?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          question_count?: number
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          question_count?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          ends_at: string
          granted_by: string | null
          id: string
          plan_id: string | null
          source: string | null
          starts_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          granted_by?: string | null
          id?: string
          plan_id?: string | null
          source?: string | null
          starts_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          granted_by?: string | null
          id?: string
          plan_id?: string | null
          source?: string | null
          starts_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subsystems: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          system_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          system_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          system_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subsystems_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
        ]
      }
      systems: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          subject_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "systems_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      test_questions: {
        Row: {
          answered_at: string | null
          id: string
          is_correct: boolean | null
          is_flagged: boolean | null
          is_marked: boolean | null
          question_id: string
          question_order: number
          selected_answer: string | null
          test_id: string
          time_spent: number | null
        }
        Insert: {
          answered_at?: string | null
          id?: string
          is_correct?: boolean | null
          is_flagged?: boolean | null
          is_marked?: boolean | null
          question_id: string
          question_order: number
          selected_answer?: string | null
          test_id: string
          time_spent?: number | null
        }
        Update: {
          answered_at?: string | null
          id?: string
          is_correct?: boolean | null
          is_flagged?: boolean | null
          is_marked?: boolean | null
          question_id?: string
          question_order?: number
          selected_answer?: string | null
          test_id?: string
          time_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_questions_selected_answer_fkey"
            columns: ["selected_answer"]
            isOneToOne: false
            referencedRelation: "answer_choices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          completed_at: string | null
          created_at: string
          custom_question_ids: Json | null
          filters_json: Json | null
          id: string
          mode: string
          num_questions: number
          public_id: number
          question_mode: string
          score: number | null
          source_mode: string | null
          status: string
          test_name: string | null
          time_spent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          custom_question_ids?: Json | null
          filters_json?: Json | null
          id?: string
          mode?: string
          num_questions: number
          public_id?: number
          question_mode?: string
          score?: number | null
          source_mode?: string | null
          status?: string
          test_name?: string | null
          time_spent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          custom_question_ids?: Json | null
          filters_json?: Json | null
          id?: string
          mode?: string
          num_questions?: number
          public_id?: number
          question_mode?: string
          score?: number | null
          source_mode?: string | null
          status?: string
          test_name?: string | null
          time_spent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_bookmarks: {
        Row: {
          article_id: string
          bookmark_type: string | null
          created_at: string
          id: string
          section_id: string | null
          user_id: string
        }
        Insert: {
          article_id: string
          bookmark_type?: string | null
          created_at?: string
          id?: string
          section_id?: string | null
          user_id: string
        }
        Update: {
          article_id?: string
          bookmark_type?: string | null
          created_at?: string
          id?: string
          section_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "medical_library_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bookmarks_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "medical_library_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_highlights: {
        Row: {
          article_id: string
          created_at: string
          end_offset: number
          highlight_color: string | null
          id: string
          section_id: string | null
          selected_text: string
          start_offset: number
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          end_offset: number
          highlight_color?: string | null
          id?: string
          section_id?: string | null
          selected_text: string
          start_offset: number
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          end_offset?: number
          highlight_color?: string | null
          id?: string
          section_id?: string | null
          selected_text?: string
          start_offset?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_highlights_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "medical_library_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_highlights_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "medical_library_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_navigation_preferences: {
        Row: {
          collapsed: boolean | null
          created_at: string | null
          id: string
          subject_id: string | null
          system_id: string | null
          user_id: string
        }
        Insert: {
          collapsed?: boolean | null
          created_at?: string | null
          id?: string
          subject_id?: string | null
          system_id?: string | null
          user_id: string
        }
        Update: {
          collapsed?: boolean | null
          created_at?: string | null
          id?: string
          subject_id?: string | null
          system_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_navigation_preferences_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_navigation_preferences_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notes: {
        Row: {
          article_id: string
          created_at: string
          highlight_id: string | null
          id: string
          note_text: string
          section_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          highlight_id?: string | null
          id?: string
          note_text: string
          section_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          highlight_id?: string | null
          id?: string
          note_text?: string
          section_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "medical_library_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_highlight_id_fkey"
            columns: ["highlight_id"]
            isOneToOne: false
            referencedRelation: "user_highlights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "medical_library_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_question_status: {
        Row: {
          id: string
          question_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          question_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          question_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_status_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_read_progress: {
        Row: {
          article_id: string
          created_at: string
          id: string
          last_section_id: string | null
          progress_percentage: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          last_section_id?: string | null
          progress_percentage?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          last_section_id?: string | null
          progress_percentage?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_read_progress_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "medical_library_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_read_progress_last_section_id_fkey"
            columns: ["last_section_id"]
            isOneToOne: false
            referencedRelation: "medical_library_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_add_annotation: boolean
          auto_add_flashcard: boolean
          auto_add_notebook: boolean
          color_theme: string
          confirm_answer_omission: boolean
          content_padding: number
          created_at: string
          exhibit_style: string
          font_size: string
          font_weight: string
          hide_answered_correct_percent: boolean
          highlight_color: string
          highlight_palette: string[]
          id: string
          image_alignment: string
          line_width: number
          multicolor_highlighting: boolean
          night_mode_auto: boolean
          night_mode_end: string
          night_mode_start: string
          pause_timer_on_blur: boolean
          show_timer: boolean
          sidebar_behavior: string
          smart_context_menu: boolean
          split_view: boolean
          text_alignment: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_add_annotation?: boolean
          auto_add_flashcard?: boolean
          auto_add_notebook?: boolean
          color_theme?: string
          confirm_answer_omission?: boolean
          content_padding?: number
          created_at?: string
          exhibit_style?: string
          font_size?: string
          font_weight?: string
          hide_answered_correct_percent?: boolean
          highlight_color?: string
          highlight_palette?: string[]
          id?: string
          image_alignment?: string
          line_width?: number
          multicolor_highlighting?: boolean
          night_mode_auto?: boolean
          night_mode_end?: string
          night_mode_start?: string
          pause_timer_on_blur?: boolean
          show_timer?: boolean
          sidebar_behavior?: string
          smart_context_menu?: boolean
          split_view?: boolean
          text_alignment?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_add_annotation?: boolean
          auto_add_flashcard?: boolean
          auto_add_notebook?: boolean
          color_theme?: string
          confirm_answer_omission?: boolean
          content_padding?: number
          created_at?: string
          exhibit_style?: string
          font_size?: string
          font_weight?: string
          hide_answered_correct_percent?: boolean
          highlight_color?: string
          highlight_palette?: string[]
          id?: string
          image_alignment?: string
          line_width?: number
          multicolor_highlighting?: boolean
          night_mode_auto?: boolean
          night_mode_end?: string
          night_mode_start?: string
          pause_timer_on_blur?: boolean
          show_timer?: boolean
          sidebar_behavior?: string
          smart_context_menu?: boolean
          split_view?: boolean
          text_alignment?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "editor"
        | "moderator"
        | "support"
        | "content_manager"
        | "question_reviewer"
        | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "editor",
        "moderator",
        "support",
        "content_manager",
        "question_reviewer",
        "user",
      ],
    },
  },
} as const
