package com.example.traphe_backend.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;

import java.io.IOException;

public class XssSanitizerDeserializer extends StdDeserializer<String> {

    public XssSanitizerDeserializer() {
        super(String.class);
    }

    private String escapeHtml(String input) {
        if (input == null)
            return null;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            switch (c) {
                case '<':
                    sb.append("&lt;");
                    break;
                case '>':
                    sb.append("&gt;");
                    break;
                case '&':
                    sb.append("&amp;");
                    break;
                case '"':
                    sb.append("&quot;");
                    break;
                case '\'':
                    sb.append("&#39;");
                    break;
                case '/':
                    sb.append("&#47;");
                    break;
                default:
                    sb.append(c);
            }
        }
        return sb.toString();
    }

    @Override
    public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        if (value != null) {
            // Escape HTML characters to prevent XSS while preserving Unicode (Vietnamese)
            // characters
            return escapeHtml(value);
        }
        return null;
    }
}
