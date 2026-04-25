package com.varnesh.fraud_detection_service.auth;

import jakarta.persistence.*;
import java.time.Instant;

//Marks as a Table in the Database
@Entity
@Table(name="users")

public class User {
    //Primary Key of the Table
    @Id
    //Generated Value is used to generate a unique value for the Primary Key
    @GeneratedValue(strategy =GenerationType.IDENTITY)
    private Long id;
    //Email is used to store the email of the User
    @Column(nullable = false, unique = true)
    private String email;

    //Password Hash is used to store the hashed password in the Database
    @Column(name="password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    //PrePersist is used to set the createdAt field to the current time when the User is created
    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    //Getters and Setters for the User class
    public Long getId(){
        return id;
    }

    public String getEmail() { 
        return email; 
    }

    public String getPasswordHash() { 
        return passwordHash; 
    }

    public Instant getCreatedAt() { 
        return createdAt; 
    }
    
    public void setEmail(String email) { 
        this.email = email; 
    }
    
    public void setPasswordHash(String passwordHash) { 
        this.passwordHash = passwordHash; 
    }
}

