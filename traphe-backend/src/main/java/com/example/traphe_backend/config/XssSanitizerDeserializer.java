package com.example.traphe_backend.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import org.springframework.web.util.HtmlUtils;

import java.io.IOException;

public class XssSanitizerDeserializer extends StdDeserializer<String> {

    public XssSanitizerDeserializer() {
        super(String.class);
    }

    @Override
    public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        if (value != null) {
            // Escape HTML characters to prevent XSS
            return HtmlUtils.htmlEscape(value);
        }
        return null;
    }
}
