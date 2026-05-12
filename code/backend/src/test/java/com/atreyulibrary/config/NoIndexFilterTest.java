package com.atreyulibrary.config;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;

class NoIndexFilterTest {

    @Test
    void addsNoIndexHeaderWhenResponseIsHttp() throws Exception {
        NoIndexFilter filter = new NoIndexFilter();
        ServletRequest request = mock(ServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(response).setHeader("X-Robots-Tag", "noindex, nofollow");
    }

    @Test
    void skipsHeaderWhenResponseIsNotHttp() throws Exception {
        NoIndexFilter filter = new NoIndexFilter();
        ServletRequest request = mock(ServletRequest.class);
        ServletResponse response = mock(ServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    @Test
    void continuesFilterChain() throws Exception {
        NoIndexFilter filter = new NoIndexFilter();
        ServletRequest request = mock(ServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
    }
}
