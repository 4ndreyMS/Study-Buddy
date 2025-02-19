package com.cenfotec.config;

import java.time.Duration;
import org.ehcache.config.builders.*;
import org.ehcache.jsr107.Eh107Configuration;
import org.hibernate.cache.jcache.ConfigSettings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.info.GitProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.context.annotation.*;
import tech.jhipster.config.JHipsterProperties;
import tech.jhipster.config.cache.PrefixedKeyGenerator;

@Configuration
@EnableCaching
public class CacheConfiguration {

    private GitProperties gitProperties;
    private BuildProperties buildProperties;
    private final javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration;

    public CacheConfiguration(JHipsterProperties jHipsterProperties) {
        JHipsterProperties.Cache.Ehcache ehcache = jHipsterProperties.getCache().getEhcache();

        jcacheConfiguration =
            Eh107Configuration.fromEhcacheCacheConfiguration(
                CacheConfigurationBuilder
                    .newCacheConfigurationBuilder(Object.class, Object.class, ResourcePoolsBuilder.heap(ehcache.getMaxEntries()))
                    .withExpiry(ExpiryPolicyBuilder.timeToLiveExpiration(Duration.ofSeconds(ehcache.getTimeToLiveSeconds())))
                    .build()
            );
    }

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer(javax.cache.CacheManager cacheManager) {
        return hibernateProperties -> hibernateProperties.put(ConfigSettings.CACHE_MANAGER, cacheManager);
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer() {
        return cm -> {
            createCache(cm, com.cenfotec.repository.UserRepository.USERS_BY_LOGIN_CACHE);
            createCache(cm, com.cenfotec.repository.UserRepository.USERS_BY_EMAIL_CACHE);
            createCache(cm, com.cenfotec.domain.User.class.getName());
            createCache(cm, com.cenfotec.domain.Authority.class.getName());
            createCache(cm, com.cenfotec.domain.User.class.getName() + ".authorities");
            createCache(cm, com.cenfotec.domain.PersistentToken.class.getName());
            createCache(cm, com.cenfotec.domain.User.class.getName() + ".persistentTokens");
            createCache(cm, com.cenfotec.domain.ExtraUserInfo.class.getName());
            createCache(cm, com.cenfotec.domain.News.class.getName());
            createCache(cm, com.cenfotec.domain.Events.class.getName());
            createCache(cm, com.cenfotec.domain.TodoList.class.getName());
            createCache(cm, com.cenfotec.domain.Pomodoro.class.getName());
            createCache(cm, com.cenfotec.domain.Courses.class.getName());
            createCache(cm, com.cenfotec.domain.Courses.class.getName() + ".users");
            createCache(cm, com.cenfotec.domain.Courses.class.getName() + ".sections");
            createCache(cm, com.cenfotec.domain.Section.class.getName());
            createCache(cm, com.cenfotec.domain.Section.class.getName() + ".files");
            createCache(cm, com.cenfotec.domain.Files.class.getName());
            createCache(cm, com.cenfotec.domain.Category.class.getName());
            createCache(cm, com.cenfotec.domain.Category.class.getName() + ".courses");
            createCache(cm, com.cenfotec.domain.UserVotes.class.getName());
            createCache(cm, com.cenfotec.domain.CourseVotes.class.getName());
            createCache(cm, com.cenfotec.domain.ForoEntity.class.getName());
            // jhipster-needle-ehcache-add-entry
        };
    }

    private void createCache(javax.cache.CacheManager cm, String cacheName) {
        javax.cache.Cache<Object, Object> cache = cm.getCache(cacheName);
        if (cache != null) {
            cache.clear();
        } else {
            cm.createCache(cacheName, jcacheConfiguration);
        }
    }

    @Autowired(required = false)
    public void setGitProperties(GitProperties gitProperties) {
        this.gitProperties = gitProperties;
    }

    @Autowired(required = false)
    public void setBuildProperties(BuildProperties buildProperties) {
        this.buildProperties = buildProperties;
    }

    @Bean
    public KeyGenerator keyGenerator() {
        return new PrefixedKeyGenerator(this.gitProperties, this.buildProperties);
    }
}
