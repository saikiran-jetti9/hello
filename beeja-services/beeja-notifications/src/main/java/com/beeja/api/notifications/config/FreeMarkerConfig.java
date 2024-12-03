package com.beeja.api.notifications.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.ui.freemarker.FreeMarkerConfigurationFactoryBean;

/**
 * Configuration class for FreeMarker template engine. FreeMarker is used to render email templates
 * in a Java Spring application.
 */
@Configuration
public class FreeMarkerConfig {

  /**
   * Configures FreeMarker to load templates from the classpath. The templates are expected to be
   * located in the directory specified by the templateLoaderPath.
   *
   * @return FreeMarkerConfigurationFactoryBean instance configured to load templates from the
   *     classpath (resources->emailTemplates)
   */
  @Primary
  @Bean
  public FreeMarkerConfigurationFactoryBean factoryBean() {
    FreeMarkerConfigurationFactoryBean freeMarkerConfigurationFactoryBean =
        new FreeMarkerConfigurationFactoryBean();
    freeMarkerConfigurationFactoryBean.setTemplateLoaderPath("classpath:/emailTemplates");
    return freeMarkerConfigurationFactoryBean;
  }
}
