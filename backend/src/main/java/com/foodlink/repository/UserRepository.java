package com.foodlink.repository;

import com.foodlink.model.Role;
import com.foodlink.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Collection;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    Page<User> findByRoleInAndLocationIgnoreCase(Collection<Role> roles, String location, Pageable pageable);
}
